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
import {ActivatedRoute} from '@angular/router';
import WebViewer, {WebViewerInstance} from '@pdftron/webviewer';
import {Subject} from 'rxjs';
import {RapportService} from '../main/apps/rapport/rapport.service';
import {DocumentService} from './document.service';
import {SujetService} from "../main/apps/sujet/sujet.service";

@Component({
  selector: 'app-webviewer',
  styleUrls: ['webviewer.component.css'],
  templateUrl: 'webviewer.component.html',
})
export class WebviewerComponent implements AfterViewInit, OnChanges, OnDestroy, OnInit {
  wvInstance?: WebViewerInstance;
  @ViewChild('viewer') viewer!: ElementRef; // Référence à l'élément HTML du viewer
  @Output() coreControlsEvent: EventEmitter<string> = new EventEmitter();
  @Input() documentId: number = 1; // Identifiant du document, valeur par défaut
  public rapportContent: string = '';
  public sujetContent: string = '';

  private documentLoaded$ = new Subject<void>();
  private annotationsLoaded$ = new Subject<void>();
  private fichierUrl: string;

  constructor(
    private documentService: DocumentService,
    private rapportService: RapportService,
    private sujetService: SujetService,
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
        initialDoc: this.fichierUrl, // Document initial (peut être vide)
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
        this.fichierUrl = rapport.contenu;

      },
      (error) => console.error('Error loading rapport:', error)
    );
  }

  private loadSujet(): void {
    if (!this.documentId || !this.wvInstance) {
      console.warn('Sujet ID or WebViewer instance is not ready yet.');
      return;
    }

    this.sujetService.getSujetById(this.documentId).subscribe(
        (sujet) => {
          this.fichierUrl = sujet.description;

        },
        (error) => console.error('Error loading sujet:', error)
    );
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
      const rapportId = params.get('content');
      console.log("voici l'id du document " + rapportId);
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
