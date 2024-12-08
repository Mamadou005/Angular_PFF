import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { UserEditService } from 'app/main/apps/user/user-edit/user-edit.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.scss']
})
export class UserEditComponent implements OnInit, OnDestroy {
  public url = this.router.url;
  public urlLastValue: string;
  public rows: any[];
  public nom: string;
  public prenom: string;
  public email: string;
  public password: string;
  public role: string;
  public matricule: string;
  public matriculeEtudiant: string;
  public matriculeEncadreur: string;
  public departement: string;
  public selectedRole: string;

  public roles: string[] = ['ADMIN', 'SECRETAIRE', 'ENCADREUR', 'ETUDIANT'];

  private _unsubscribeAll: Subject<any>;

  @ViewChild('accountForm') accountForm: NgForm;

  constructor(private router: Router, private _userEditService: UserEditService) {
    this._unsubscribeAll = new Subject();
    this.urlLastValue = this.url.substr(this.url.lastIndexOf('/') + 1);
  }

  ngOnInit(): void {
    this._userEditService.onUserEditChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(response => {
      console.log('Données reçues:', response);
  
      if (response && typeof response === 'object') {
        this.rows = Array.isArray(response) ? response : [response];
      } else {
        this.rows = [];
      }
  
      if (Array.isArray(this.rows)) {
        const user = this.rows.find(row => row.id == this.urlLastValue);
        if (user) {
          this.nom = user.nom;
          this.prenom = user.prenom;
          this.email = user.email;
          this.password = user.password;
          this.role = user.role;
          this.matricule= user.matricule;
          this.matriculeEtudiant = user.matriculeEtudiant;
          this.matriculeEncadreur = user.matriculeEncadreur;
          this.departement = user.departement;
          this.selectedRole = user.role;
        } else {
          console.error('Utilisateur non trouvé');
        }
      } else {
        console.error('Les données reçues ne sont pas un tableau');
      }
    });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  toggleSidebar(sidebarId: string): void {
    const sidebar = document.getElementById(sidebarId);
    if (sidebar) {
      sidebar.classList.toggle('open');
    }
  }

  resetFormWithDefaultValues(): void {
    this.accountForm.resetForm({
      nom: this.nom || '',
      prenom: this.prenom || '',
      email: this.email || '',
      password: this.password || '',
      role: this.role || '',
      matricule: this.matricule || '',
      matriculeEtudiant: this.matriculeEtudiant || '',
      matriculeEncadreur: this.matriculeEncadreur || '',
      departement: this.departement || '',
      selectedRole: this.selectedRole || ''
    });
  }

  submit(form: NgForm): void {
    if (form.valid) {
      console.log('Form Submitted:', form.value);
  
      const userId = this.urlLastValue; 
      this._userEditService.updateUser(userId, form.value).subscribe(
        (response) => {
          console.log('Utilisateur mis à jour avec succès', response);
          // Affichage d'un message de succès
          alert('Utilisateur mis à jour avec succès!');
          setTimeout(() => {
            this.router.navigate(['apps/user/user-list']);
          }, 1000);
        },
        (error) => {
          console.log("test ", form.value);
          console.error('Erreur lors de la soumission du formulaire', error);
          // Affichage d'un message d'erreur
          alert('Une erreur est survenue, veuillez réessayer.');
        }
      );
    } else {
      console.error('Formulaire invalide');
      alert('Veuillez remplir correctement tous les champs.');
    }
  }
  
}
