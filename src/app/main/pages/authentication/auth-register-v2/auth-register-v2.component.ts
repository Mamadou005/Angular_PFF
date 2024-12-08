import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { CoreConfigService } from '@core/services/config.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthRegisterService } from './auth-register-v2.service'; // Importation du service

@Component({
  selector: 'app-auth-register-v2',
  templateUrl: './auth-register-v2.component.html',
  styleUrls: ['./auth-register-v2.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AuthRegisterV2Component implements OnInit, OnDestroy {
  public coreConfig: any;
  public passwordTextType = false;
  public registerForm: UntypedFormGroup;
  public submitted = false;
  public selectedRole: string | null = null;
  private _unsubscribeAll: Subject<any>;

  constructor(
    private _coreConfigService: CoreConfigService,
    private _formBuilder: UntypedFormBuilder,
    private authRegisterService: AuthRegisterService // Injection du service
  ) {
    this._unsubscribeAll = new Subject();
    this._coreConfigService.config = {
      layout: {
        navbar: { hidden: true },
        menu: { hidden: true },
        footer: { hidden: true },
        customizer: false,
        enableLocalStorage: false,
      },
    };
  }

  ngOnInit(): void {
    // Initialisation du formulaire avec des validations
    this.registerForm = this._formBuilder.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      role: ['', Validators.required],
      matriculeEtudiant: [''],
      matriculeEncadreur: [''],
      departement: [''],
    });

    // Configuration de la variable coreConfig pour la gestion de la config
    this._coreConfigService.config.pipe(takeUntil(this._unsubscribeAll)).subscribe(config => {
      this.coreConfig = config;
    });
  }

  // Accesseur pour les contrôles du formulaire
  get f() {
    return this.registerForm.controls;
  }

  // Toggle la visibilité du mot de passe
  togglePasswordTextType(): void {
    this.passwordTextType = !this.passwordTextType;
  }

  // Gestion du changement de rôle
  onRoleChange(role: string): void {
    this.selectedRole = role;
    this.resetOptionalFields();
  }

  // Réinitialisation des champs optionnels en fonction du rôle
  resetOptionalFields(): void {
    this.registerForm.patchValue({
      matriculeEtudiant: '',
      matriculeEncadreur: '',
      departement: '',
    });
  }

  // Envoi du formulaire
  onSubmit(): void {
    this.submitted = true;

    // Vérifier si le formulaire est valide
    if (this.registerForm.invalid) {
      return;
    }

    // Préparation des données à envoyer au backend
    const userData = this.registerForm.value;

    // Appel du service d'enregistrement utilisateur
    this.authRegisterService.registerUser(userData).subscribe(
      response => {
        console.log('Utilisateur enregistré avec succès', response);
        // Vous pouvez rediriger vers une autre page après l'enregistrement, si nécessaire
        // Exemple : this.router.navigate(['/login']);
      },
      error => {
        console.error('Erreur lors de l\'enregistrement de l\'utilisateur', error);
        // Afficher un message d'erreur à l'utilisateur
      }
    );
  }

  ngOnDestroy(): void {
    // Cleanup des abonnements
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
