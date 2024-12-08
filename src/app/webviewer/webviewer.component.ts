import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import WebViewer, { WebViewerInstance } from '@pdftron/webviewer';
import { Subject } from 'rxjs';
import { RapportService } from '../main/apps/rapport/rapport.service';
import { DocumentService } from './document.service';

@Component({
  selector: 'app-webviewer',
  styleUrls: ['webviewer.component.css'],
  templateUrl: 'webviewer.component.html',
})
export class WebviewerComponent
  implements AfterViewInit, OnChanges, OnDestroy, OnInit
{
  wvInstance?: WebViewerInstance;
  @ViewChild('viewer') viewer!: ElementRef;
  @Output() coreControlsEvent: EventEmitter<string> = new EventEmitter();
  @Input() documentId: number = 1;
  public rapportContent: string = '';
  public sujetContent: string = '';

  private documentLoaded$ = new Subject<void>();
  private annotationsLoaded$ = new Subject<void>();
  private fichierUrl: string = '';
  public rapportTitle: string = '';

  constructor(
    private documentService: DocumentService,
    private rapportService: RapportService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const rapportId = params['id'];
      if (rapportId) {
        this.documentId = parseInt(rapportId, 10);
        this.loadDocument();
      }
    });
  }

  ngAfterViewInit(): void {
    if (this.viewer && this.viewer.nativeElement) {
      if (this.fichierUrl) {
        this.initializeViewer(this.fichierUrl);  // Initialiser WebViewer seulement après que fichierUrl est disponible
      } else {
        console.warn('Document URL is not defined yet.');
      }
    } else {
      console.error('Viewer element is not initialized in ngAfterViewInit.');
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['documentId'] &&
      this.documentId !== changes['documentId'].previousValue
    ) {
      this.loadDocument();
    }
    // Si le fichierUrl change, on initialise à nouveau WebViewer
    if (changes['fichierUrl']) {
      this.initializeViewer(this.fichierUrl);
    }
  }

  private initializeViewer(url: string): void {
    if (!this.viewer || !this.viewer.nativeElement) {
      console.error('Viewer element is not initialized.');
      return;
    }

    WebViewer(
      {
        path: '../../lib',
        enableOfficeEditing: true,
        initialDoc: url,  // Utilisation correcte de fichierUrl
        licenseKey:
          'demo:1731372460021:7ef9fd110300000000ec33ffa1b45492254e5640546bff52dc10b5080f',
      },
      this.viewer.nativeElement
    )
      .then((instance) => {
        this.wvInstance = instance;
        this.coreControlsEvent.emit(instance.UI.LayoutMode.Single);
        this.setUpEventListeners(instance);
      })
      .catch((error) => {
        console.error('Failed to initialize WebViewer:', error);
      });
  }

  private setUpEventListeners(instance: WebViewerInstance): void {
    const { documentViewer, Annotations, annotationManager } = instance.Core;

    instance.UI.openElements(['notesPanel']);

    documentViewer.addEventListener('annotationsLoaded', () => {
      this.annotationsLoaded$.next();
    });

    documentViewer.addEventListener('documentLoaded', () => {
      this.documentLoaded$.next();
      this.addRectangleAnnotation(Annotations, annotationManager);
    });
  }

  private loadDocument(): void {
    if (!this.documentId) {
      console.warn('Document ID is not defined.');
      return;
    }

    this.rapportService.getRapportById(this.documentId).subscribe(
      (rapport) => {
        this.rapportTitle = rapport.titre;
        this.fichierUrl = rapport.contenuUrl;  // Assurez-vous que fichierUrl est bien assigné ici
        this.rapportContent = rapport.content;
        // Au moment où fichierUrl est chargé, initialisez le viewer
        if (this.fichierUrl) {
          this.initializeViewer(this.fichierUrl);
        } else {
          console.warn('fichierUrl is not available yet.');
        }
      },
      (error) => console.error('Erreur lors du chargement du rapport:', error)
    );
  }

  private addRectangleAnnotation(
    Annotations: any,
    annotationManager: any
  ): void {
    const rectangleAnnot = new Annotations.RectangleAnnotation();
    rectangleAnnot.PageNumber = 1;
    rectangleAnnot.X = 100;
    rectangleAnnot.Y = 150;
    rectangleAnnot.Width = 200;
    rectangleAnnot.Height = 100;
    rectangleAnnot.StrokeColor = new Annotations.Color(255, 0, 0);

    annotationManager.addAnnotation(rectangleAnnot);
    annotationManager.redrawAnnotation(rectangleAnnot);
  }

  ngOnDestroy(): void {
    this.documentLoaded$.next();
    this.documentLoaded$.complete();
    this.annotationsLoaded$.next();
    this.annotationsLoaded$.complete();

    if (this.wvInstance) {
      const viewerElement = this.viewer.nativeElement;
      viewerElement.innerHTML = '';
    }
  }
}
