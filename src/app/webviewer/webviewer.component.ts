import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
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
export class WebviewerComponent implements AfterViewInit, OnChanges, OnDestroy {
  wvInstance?: WebViewerInstance;
  @ViewChild('viewer') viewer!: ElementRef; // Référence à l'élément HTML du viewer
  @Output() coreControlsEvent: EventEmitter<string> = new EventEmitter();
  @Input() documentId: number = 1; // Identifiant du document, valeur par défaut
  public rapportContent: string = '';

  private documentLoaded$ = new Subject<void>();
  private annotationsLoaded$ = new Subject<void>();

  constructor(
    private documentService: DocumentService,
    private rapportService: RapportService,
    private route: ActivatedRoute
  ) {}

  ngAfterViewInit(): void {
    // Initialisation du WebViewer après le rendu de la vue
    if (!this.viewer || !this.viewer.nativeElement) {
      console.error('Viewer element is not initialized in ngAfterViewInit.');
      return;
    }
    this.initializeViewer('');
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Chargement du document si l'ID change
    if (
      changes['documentId'] &&
      this.documentId !== changes['documentId'].previousValue
    ) {
      this.loadDocument();
    }
  }

  private initializeViewer(url: string): void {
    if (!this.viewer || !this.viewer.nativeElement) {
      console.error('Viewer element is not initialized.');
      return;
    }

    WebViewer(
      {
        path: '../../lib', // Chemin vers les ressources WebViewer
        enableOfficeEditing: true,
        initialDoc: url || undefined, // Document initial (peut être vide)
        licenseKey:
          'demo:1731372460021:7ef9fd110300000000ec33ffa1b45492254e5640546bff52dc10b5080f',
      },
      this.viewer.nativeElement
    )
      .then((instance) => {
        console.log('WebViewer instance initialized:', instance);
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

    instance.UI.openElements(['notesPanel']); // Ouvre le panneau des annotations

    documentViewer.addEventListener('annotationsLoaded', () => {
      console.log('Annotations loaded');
      this.annotationsLoaded$.next();
    });

    documentViewer.addEventListener('documentLoaded', () => {
      console.log('Document loaded');
      this.documentLoaded$.next();
      this.addRectangleAnnotation(Annotations, annotationManager);
    });
  }

  private loadDocument(): void {
    if (!this.documentId || !this.wvInstance) {
      console.warn('Document ID or WebViewer instance is not ready yet.');
      return;
    }

    this.rapportService.getRapportById(this.documentId).subscribe(
      (rapport) => {
        const rapportUrl = this.createHtmlDocumentUrl(rapport.contenu);
        this.wvInstance?.UI.loadDocument(rapportUrl, {
          filename: `rapport_${this.documentId}.html`,
        });
      },
      (error) => console.error('Error loading rapport:', error)
    );
  }

  private createHtmlDocumentUrl(content: string): string {
    // Création d'une URL Blob pour le contenu HTML dynamique
    const blob = new Blob([content], { type: 'text/html' });
    return URL.createObjectURL(blob);
  }

  private addRectangleAnnotation(
    Annotations: any,
    annotationManager: any
  ): void {
    const rectangleAnnot = new Annotations.RectangleAnnotation();
    rectangleAnnot.PageNumber = 1; // Sur quelle page ajouter l'annotation
    rectangleAnnot.X = 100; // Position X
    rectangleAnnot.Y = 150; // Position Y
    rectangleAnnot.Width = 200; // Largeur
    rectangleAnnot.Height = 100; // Hauteur
    rectangleAnnot.StrokeColor = new Annotations.Color(255, 0, 0); // Couleur rouge

    annotationManager.addAnnotation(rectangleAnnot);
    annotationManager.redrawAnnotation(rectangleAnnot);
  }

  ngOnInit(): void {
    // Récupération des paramètres de la route pour charger le bon document
    this.route.queryParams.subscribe((params) => {
      const rapportId = params['id'];
      console.log("voici l'id du document " +rapportId);
      if (rapportId) {
        this.documentId = rapportId;
        this.loadDocument();
      }
    });
  }

  ngOnDestroy(): void {
    // Nettoyage des observables
    this.documentLoaded$.next();
    this.documentLoaded$.complete();
    this.annotationsLoaded$.next();
    this.annotationsLoaded$.complete();

    // Libération des ressources WebViewer
    if (this.wvInstance) {
      const viewerElement = this.viewer.nativeElement;
      viewerElement.innerHTML = '';
    }
  }
}
