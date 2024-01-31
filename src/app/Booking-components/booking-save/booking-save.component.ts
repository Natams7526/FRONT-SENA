import { Component, inject, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { RickService } from '../../services/rick.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatNativeDateModule, ThemePalette } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { BookingService } from '../../services/booking.service';
import { format } from 'date-fns';
import { BookingFormComponent } from '../booking-form/booking-form.component';
import { LoaderComponent } from '../../loader/loader.component';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { ModalComponent } from '../../modal/modal.component';
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-booking-save',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatCardModule,
    MatInputModule,
    ReactiveFormsModule,
    MatDividerModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    BookingFormComponent,
    LoaderComponent,
    ModalComponent,
    MatRadioModule,
    MatCheckboxModule,
    MatChipsModule,
    MatSlideToggleModule,
  ],
  templateUrl: './booking-save.component.html',
  styleUrl: './booking-save.component.css',
})
export class BookingSaveComponent {
  // injection services
  appoitmentService: BookingService = inject(BookingService);
  barberService: RickService = inject(RickService);

  // parametros filtro
  filtro: FormGroup;
  barberList: any[] = [];
  daySelected = format(new Date(), 'yyyy-MM-dd');
  displayedColumns: string[] = ['data'];
  barberSelected = 0;
  clientSelected = '';
  showCanceled = false;

  //envio de registro para formulario de agenda
  // @Input() appointmentList: any[];
  @Output() editarRegistro = new EventEmitter<any>();

  idActualizar: number | undefined;
  idEliminar: number | undefined;
  appointmentDetails: any;

  // parametos tabla
  appointmentList: any[] = [];
  appointmentListShow: any[] = [];
  loading = true;
  isModalOpen = false;
  isFilterOpen = false;

  //borrar si no funciona
  color: ThemePalette = 'accent';
  checked = false;

  constructor(private formBuilder: FormBuilder, public dialog: MatDialog) {
    this.filtro = this.formBuilder.group({
      dayFilter: new Date(),
      barbero: '',
    });
    this.loadBarbers();
    this.loadData();
    // Escuchar cambios en el Filtro del Dia
    this.filtro.get('dayFilter')?.valueChanges.subscribe((value) => {
      this.daySelected = format(value, 'yyyy-MM-dd');
      this.loadData();
    });
    // Escuchar cambios en el filtro 'barbero'
    this.filtro.get('barbero')?.valueChanges.subscribe((value) => {
      this.barberSelected = value;
      this.loadData();
    });

    this.appoitmentService.nuevoRegistro$.subscribe(() => {
      // Lógica para actualizar la tabla
      this.loadData();
      this.isModalOpen = false;
    });
  }

  async loadData() {
    try {
      const filtro = {
        barberId: this.barberSelected,
        timeStart: this.daySelected,
      };
      await this.appoitmentService.getData(filtro).then((data: any) => {
        this.appointmentList = data.data;
        this.filtrarLista(this.appointmentList);
        this.loading = false;
      });
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  }

  filtrarLista(appointmentList: any[]) {
    // this.showCanceled = !this.showCanceled;
    this.appointmentListShow = appointmentList.filter(
      (cita) => cita.canceled === this.showCanceled || cita.canceled === null
    );
  }

  toggleMostrarCitas() {
    this.showCanceled = !this.showCanceled;
    this.filtrarLista(this.appointmentList);
  }

  async loadBarbers() {
    try {
      await this.barberService.getData().then((data: any) => {
        // this.barberList.push({ id: 0, name: 'Todos' });
        this.barberList = data.data;
        this.loading = false;
      });
    } catch (error) {
      console.error('Error al cargar la lista de barberos:', error);
    }
  }

  /**
   * Actualizar Appointment
   */
  updateData(appointmentDetails: any): void {
    this.isModalOpen = true;
    this.appointmentDetails = {
      id: appointmentDetails.id,
      barber: appointmentDetails.barber,
      daySelected: appointmentDetails.timeStart,
      timeStart: appointmentDetails.timeStart,
      client: appointmentDetails.client,
    };
  }

  async cancelAppointment(data: any) {
    const appointmentToUpdate = {
      barberId: data.barber.id,
      timeStart: data.timeStart,
      canceled: !data.canceled,
      client: {
        name: data.client.name,
        phone: data.client.phone,
      },
    };
    try {
      await this.appoitmentService.cancelAppointment(
        appointmentToUpdate,
        data.id
      );
      // Actualizar la lista de datos después de la eliminación
      this.appoitmentService.notificarNuevoRegistro();
    } catch (error) {
      console.error('Error al cancelar:', error);
    }
  }

  modalNuevaCita() {
    this.isModalOpen = !this.isModalOpen;
    this.appointmentDetails = undefined;
  }

  closeModal() {
    this.isModalOpen = !this.isModalOpen;
    this.appointmentDetails = undefined;
    //console.info('Cerramos modal');
  }

  irAWhatsApp(phone: string): void {
    const urlWhatsApp = `https://wa.me/` + '57' + phone;
    window.open(urlWhatsApp, '_blank');
  }
}
