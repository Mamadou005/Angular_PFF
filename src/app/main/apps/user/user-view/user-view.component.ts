import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { UserViewService } from 'app/main/apps/user/user-view/user-view.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-user-view',
  templateUrl: './user-view.component.html',
  styleUrls: ['./user-view.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UserViewComponent implements OnInit, OnDestroy {
  // public
  public url = this.router.url;
  public lastValue: string;
  public data: any;

  // Déclaration des champs utilisateur supplémentaires
  public nom: string;
  public prenom: string;
  public email: string;
  public password: string;
  public role: string;
  public matriculeEtudiant: string;
  public matriculeEncadreur: string;
  public departement: string;
  public selectedRole: string;

  // private
  private _unsubscribeAll: Subject<any>;

  /**
   * Constructor
   *
   * @param {Router} router
   * @param {UserViewService} _userViewService
   */
  constructor(private router: Router, private _userViewService: UserViewService) {
    this._unsubscribeAll = new Subject();
    this.lastValue = this.url.substring(this.url.lastIndexOf('/') + 1);  // Extraction de l'ID de l'URL
  }

  // Lifecycle Hooks
  // -----------------------------------------------------------------------------------------------------
  /**
   * On init
   */
  ngOnInit(): void {
    // Récupération des données de l'utilisateur et mise à jour de la vue
    this._userViewService.onUserViewChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(response => {
      this.data = response;
    });
  }

  /**
   * Méthode appelée lors de la soumission du formulaire
   */
  onSubmit(): void {
    const user = {
      nom: this.nom,
      prenom: this.prenom,
      email: this.email,
      password: this.password,
      role: this.role,
      matriculeEtudiant: this.matriculeEtudiant,
      matriculeEncadreur: this.matriculeEncadreur,
      departement: this.departement,
      selectedRole: this.selectedRole,
    };
  
    this._userViewService.createUser(user).subscribe(
      (response) => {
        console.log('Utilisateur enregistré avec succès!', response);
      },
      (error) => {
        console.error('Erreur lors de l\'enregistrement de l\'utilisateur', error);
      }
    );
  }
  

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Se désabonner de toutes les subscriptions pour éviter les fuites de mémoire
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
