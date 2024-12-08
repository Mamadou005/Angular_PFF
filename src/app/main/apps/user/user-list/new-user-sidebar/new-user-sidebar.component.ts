import { Component, OnInit } from '@angular/core';
import { CoreSidebarService } from '@core/components/core-sidebar/core-sidebar.service';
import { UserViewService } from '../../user-view/user-view.service'; // Assurez-vous de remplacer par le chemin correct

@Component({
  selector: 'app-new-user-sidebar',
  templateUrl: './new-user-sidebar.component.html',
})
export class NewUserSidebarComponent implements OnInit {
  // Propriétés du formulaire
  public nom: string = '';
  public prenom: string = '';
  public email: string = '';
  public password: string = '';
  public role: string = '';
  public matriculeEtudiant?: string = null;
  public matriculeEncadreur?: string = null;
  public departement?: string = null;
  public selectedRole: string = '';

  /**
   * Constructor
   *
   * @param {CoreSidebarService} _coreSidebarService
   * @param {UserViewService} userService
   */
  constructor(
    private _coreSidebarService: CoreSidebarService,
    private userService: UserViewService
  ) {}

  /**
   * Toggle the sidebar
   *
   * @param name
   */
  toggleSidebar(name: string): void {
    this._coreSidebarService.getSidebarRegistry(name).toggleOpen();
  }

  /**
   * Submit the form
   *
   * @param form
   */
  submit(form: any): void {
    if (form.valid) {
      if (
        (this.role === 'ETUDIANT' && !this.matriculeEtudiant) ||
        (this.role === 'ENCADREUR' && !this.matriculeEncadreur) ||
        (this.role === 'SECRETAIRE' && !this.departement)
      ) {
        console.error('Champs spécifiques au rôle manquants.');
        return;
      }
  
      // Construire les données utilisateur avec toutes les propriétés requises
      const userData = {
        nom: this.nom,
        prenom: this.prenom,
        email: this.email,
        password: this.password,
        role: this.selectedRole,
        matriculeEtudiant: this.matriculeEtudiant || '',
        matriculeEncadreur: this.matriculeEncadreur || '',
        departement: this.departement || '',
        selectedRole: this.selectedRole,
      };
  
      // Envoi des données utilisateur via le service
      this.userService.createUser(userData).subscribe(
        (response) => {
          console.log('Utilisateur enregistré avec succès', response);
          this.toggleSidebar('new-user-sidebar');
        },
        (error) => {
          console.log("userdata ", userData);
          console.error('Erreur lors de l\'enregistrement de l\'utilisateur', error);
        }
      );
    } else {
      console.error('Formulaire invalide');
    }
  }
  

  /**
   * Handle role change
   *
   * @param role
   */
  onRoleChange(role: string): void {
    this.selectedRole = role;

    // Réinitialisation des champs en fonction du rôle
    this.matriculeEtudiant = role === 'ETUDIANT' ? '' : null;
    this.matriculeEncadreur = role === 'ENCADREUR' ? '' : null;
    this.departement = role === 'SECRETAIRE' ? '' : null;
  }

  /**
   * Angular lifecycle hook
   */
  ngOnInit(): void {
    // Initialisation des propriétés
    this.nom = '';
    this.prenom = '';
    this.email = '';
    this.password = '';
    this.role = '';
    this.selectedRole = '';
  }
}
