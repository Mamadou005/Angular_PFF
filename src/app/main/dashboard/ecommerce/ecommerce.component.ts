import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { CoreConfigService } from '@core/services/config.service';
import { CoreTranslationService } from '@core/services/translation.service';
import { AuthenticationService } from 'app/auth/service';
import { colors } from 'app/colors.const';
import { DashboardService } from 'app/main/dashboard/dashboard.service';

@Component({
  selector: 'app-ecommerce',
  templateUrl: './ecommerce.component.html',
  styleUrls: ['./ecommerce.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EcommerceComponent implements OnInit {
  @ViewChild('statisticsBarChartRef') statisticsBarChartRef: any;

  public statisticsBar: any;
  public revenueReportChartoptions: any;
  public currentUser: any;
  public isAdmin = false;
  public isEtudiant = false;
  public isEncadreur = false;


  constructor(
    private _authenticationService: AuthenticationService,
    private _dashboardService: DashboardService,
    private _coreConfigService: CoreConfigService,
    private _coreTranslationService: CoreTranslationService
  ) {}

  ngOnInit(): void {
    // Initialiser l'utilisateur actuel
    this._authenticationService.currentUser.subscribe(user => {
      this.currentUser = user;
      this.isAdmin = user?.role.includes('Admin');
      this.isEtudiant = user?.role.includes('etudiant');
      this.isEncadreur = user?.role.includes('encadreur');

    });

    // Charger les données du tableau de bord
    this.loadDashboardData();
  }

  /**
   * Charger les données du tableau de bord
   */
  private loadDashboardData(): void {
    this._dashboardService.getApiData().subscribe(data => {
      // Mettre à jour les graphiques avec les données reçues
      this.statisticsBar = this.buildStatisticsBarChart(data.statisticsBar);
      this.revenueReportChartoptions = this.buildRevenueReportChart(data.revenueReport);
    });
  }

  /**
   * Construire les options pour le graphique "Statistics Bar"
   */
  private buildStatisticsBarChart(statisticsData: any): any {
    return {
      chart: {
        height: 70,
        type: 'bar',
        stacked: true,
        toolbar: { show: false }
      },
      colors: [colors.solid.warning],
      series: [
        {
          name: '2023',
          data: statisticsData
        }
      ],
      grid: {
        show: false,
        padding: {
          left: 0,
          right: 0,
          top: -15,
          bottom: -15
        }
      },
      xaxis: {
        labels: { show: false },
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      yaxis: { show: false }
    };
  }

  /**
   * Construire les options pour le graphique "Revenue Report"
   */
  private buildRevenueReportChart(revenueData: any): any {
    return {
      chart: {
        height: 230,
        stacked: true,
        type: 'bar',
        toolbar: { show: false }
      },
      colors: [colors.solid.primary, colors.solid.warning],
      series: revenueData,
      xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
        labels: {
          style: {
            colors: '#b9b9c3',
            fontSize: '0.86rem'
          }
        }
      },
      yaxis: {
        labels: {
          style: {
            colors: '#b9b9c3',
            fontSize: '0.86rem'
          }
        }
      }
    };
  }
}
