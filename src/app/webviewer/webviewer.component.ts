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
export class WebviewerComponent implements AfterViewInit, OnChanges, OnDestroy, OnInit {
  @ViewChild('viewer') viewer!: ElementRef;
  @Output() coreControlsEvent: EventEmitter<string> = new EventEmitter();
  @Input() documentId: number = 1;

  public rapportContent: string = '';
  public sujetContent: string = '';
  public rapportTitle: string = '';

  private wvInstance?: WebViewerInstance;
  private fichierUrl: string = '';
  private documentLoaded$ = new Subject<void>();
  private annotationsLoaded$ = new Subject<void>();

  // Variables pour l'annotation
  annotationText: string = '';
  annotationX: number = 0;
  annotationY: number = 0;
  annotationPage: number = 1;

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
    if (this.viewer?.nativeElement) {
      if (this.fichierUrl) {
        this.initializeViewer(this.fichierUrl);
      } else {
        console.warn('Document URL is not defined yet.');
      }
    } else {
      console.error('Viewer element is not initialized in ngAfterViewInit.');
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['documentId']?.currentValue !== changes['documentId']?.previousValue) {
      this.loadDocument();
    }
  }

  private loadDocument(): void {
    if (!this.documentId) {
      console.warn('Document ID is not defined.');
      return;
    }

    this.rapportService.getRapportById(this.documentId).subscribe(
      (rapport) => {
        this.rapportTitle = rapport.titre;
        this.fichierUrl = rapport.contenuUrl;
        this.rapportContent = rapport.content;
        if (this.fichierUrl) {
          this.initializeViewer(this.fichierUrl);
        }
      },
      (error) => console.error('Error loading rapport:', error)
    );
  }

  private initializeViewer(url: string): void {
    const fileType = url.split('.').pop()?.toLowerCase();
    if (!fileType) {
      console.error('Unable to determine file type.');
      return;
    }

    const supportedExtensions = ['pdf', 'docx', 'xlsx', 'pptx', 'txt', 'png', 'jpg'];
    if (!supportedExtensions.includes(fileType)) {
      console.warn(`File type ${fileType} is not supported.`);
      return;
    }

    WebViewer(
      {
        path: '../../lib',
        enableOfficeEditing: true,
        initialDoc: url,
        licenseKey: 'demo:1731372460021:7ef9fd110300000000ec33ffa1b45492254e5640546bff52dc10b5080f',
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

    documentViewer.addEventListener('annotationsLoaded', () => {
      this.annotationsLoaded$.next();
    });

    documentViewer.addEventListener('documentLoaded', () => {
      this.documentLoaded$.next();
      this.addRectangleAnnotation(Annotations, annotationManager);
    });
  }

  private addRectangleAnnotation(Annotations: any, annotationManager: any): void {
    const rectangleAnnot = new Annotations.RectangleAnnotation();
    rectangleAnnot.PageNumber = this.annotationPage;
    rectangleAnnot.X = this.annotationX;
    rectangleAnnot.Y = this.annotationY;
    rectangleAnnot.Width = 200;
    rectangleAnnot.Height = 100;
    annotationManager.addAnnotation(rectangleAnnot);
    annotationManager.redrawAnnotation(rectangleAnnot);
  }

  saveModifiedDocument(): void {
    if (this.wvInstance) {
      const { documentViewer, annotationManager } = this.wvInstance.Core;
      annotationManager.exportAnnotations({ links: false }).then((xfdfString: string) => {
        const doc = documentViewer.getDocument();
        doc.getFileData({ xfdfString }).then((data: Uint8Array) => {
          const blob = new Blob([data], { type: 'application/pdf' });
          const fileName = `ModifiedDocument-${this.documentId}.pdf`;

          this.documentService.saveModifiedDocument(this.documentId, blob, fileName).subscribe(
            () => {
              console.log('Modified document saved successfully.');
              this.loadDocument();
            },
            (error) => console.error('Error saving modified document:', error)
          );
        });
      });
    } else {
      console.error('WebViewer instance is not initialized.');
    }
  }

  downloadAnnotatedFile(): void {
    if (this.wvInstance) {
      const { documentViewer } = this.wvInstance.Core;
      documentViewer.getDocument().getFileData().then((fileData: Uint8Array) => {
        const blob = new Blob([fileData], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Document-${this.documentId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      });
    } else {
      console.error('WebViewer instance is not initialized.');
    }
  }

  ngOnDestroy(): void {
    this.documentLoaded$.next();
    this.documentLoaded$.complete();
    this.annotationsLoaded$.next();
    this.annotationsLoaded$.complete();
  }
}