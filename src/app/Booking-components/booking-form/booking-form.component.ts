import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import {
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormControl,
} from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { format } from 'date-fns';
// import servicios
import { BookingService } from '../../services/booking.service';
import { ClientService } from '../../services/client.service';
import { RickService } from '../../services/rick.service';

import { LoaderComponent } from '../../loader/loader.component';

@Component({
  selector: 'app-booking-form',
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
    LoaderComponent,
  ],
  templateUrl: './booking-form.component.html',
  styleUrl: './booking-form.component.css',
})
export class BookingFormComponent {
  /**
   * Injeccion de los servicios de consumo el API
   */
  appoitmentService: BookingService = inject(BookingService);
  barberService: RickService = inject(RickService);
  clientService: ClientService = inject(ClientService);

  /**
   * Declaracion de variables para usarla en las listas desplegables del formulario
   */
  barberList: any[] = [];
  appointmentList: any[] = [];

  /**
   * Variables de renderizacion para el HTML
   */
  titulo = 'Agenda tu cita';
  flatAlerta = false;
  isOpenForm = true;
  loading = true;
  isOpenList = false;
  isConsultList = false;

  /**
   * Declaracion de Input para recepcion de data de otro componente
   */
  @Input() appointmentDetails: any;

  formulario: FormGroup;

  day = new Date();
  daySelected = '';
  barberSelected: any = '';
  clientSelected: any = '';

  urlImgProfileDefault = `https://elasticbeanstalk-us-east-1-148301147089.s3.amazonaws.com/perfil+default.jpg`;

  horaCitaList: any[] = [];
  horaCitaSelected: any = {};
  horaActual: any = format(this.day, "yyyy-MM-dd'T'HH:mm:ss");

  idActualizar: number = 0;

  /**
   * Variables para el link de Whatsapp
   */
  numeroWhatsApp = '573196073229'; // Reemplaza con el número de WhatsApp al que deseas enviar mensajes
  urlWhatsApp = `https://wa.me/${this.numeroWhatsApp}`;
  /********************************************* */

  constructor() {
    const pattern = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]{6,70}$/;
    this.formulario = new FormGroup({
      barbero: new FormControl('', Validators.required),
      daySelected: new FormControl(''),
      horaCita: new FormControl('', Validators.required),
      cliente: new FormControl('', [
        Validators.required,
        Validators.pattern(pattern),
      ]),

      phone: new FormControl('', [
        Validators.required,
        Validators.pattern('^[0-9]{10}$'),
      ]),
    });
  }

  listenerForm() {
    // Escuchar cambios en el FormControl 'barbero'
    this.formulario.get('barbero')?.valueChanges.subscribe((value) => {
      this.horaActual = format(new Date(), "yyyy-MM-dd'T'HH:mm:ss");
      this.barberSelected = value;
      if (this.barberSelected && this.barberSelected !== '') {
        this.loadSchedule(this.barberSelected.id, this.daySelected);
        if (
          this.appointmentDetails &&
          this.appointmentDetails.barber.id != this.barberSelected.id
        ) {
          this.formulario.patchValue({ horaCita: '' });
        }
      }
    });
    // Escuchar cambios en el FormControl 'daySelected'
    this.formulario.get('daySelected')?.valueChanges.subscribe((value) => {
      this.horaActual = format(new Date(), "yyyy-MM-dd'T'HH:mm:ss");
      if (value != null && this.barberSelected !== '') {
        this.daySelected = value;
        this.loadSchedule(this.barberSelected.id, this.daySelected);
      }
    });
    // Escuchar cambios en el FormControl 'horaCita'
    this.formulario.get('horaCita')?.valueChanges.subscribe((value) => {
      this.horaCitaSelected = value;
    });
    // Escuchar cambios en el FormControl 'phone'
    this.formulario.get('phone')?.valueChanges.subscribe((value) => {
      if (value.length == 10 && this.formulario.get('phone')?.valid) {
        this.formulario.patchValue({
          cliente: '',
        });
        this.getClientByPhone(value);
      }
      // this.horaCitaSelected = value;
    });
  }

  /**
   * Funcion que carga la lista de barberos para ser usada en el componente se seleccion en html
   */

  async loadBarbers() {
    try {
      await this.barberService.getData().then((data: any) => {
        this.barberList = data.data;
        this.loading = false;
      });
    } catch (error) {
      console.error('Error al cargar la lista de barberos:', error);
    }
  }

  /**
   * Funcion encargada de cargar las horas que estan disponibles para agendar una cita, dado el barbero y el dia.
   * @param barberId
   * @param day
   * @author Natalia M
   */

  async loadSchedule(barberId: number, day: String) {
    this.horaCitaList = [];
    const data = {
      timeStart: day,
      barberId: barberId,
    };
    try {
      await this.appoitmentService
        .getAppointmentsByBarberId(data)
        .then((response: any) => {
          this.appointmentList = response.data.availabilitySchedule;
          this.loading = false;
        });
      this.appointmentList.forEach((horas) => {
        let horaCitaResponse = new Date(horas.timeStart);
        let tiemLunchDefault = 13;

        if (
          horas.client == null &&
          format(horaCitaResponse, "yyyy-MM-dd'T'HH:mm:ss") > this.horaActual &&
          horaCitaResponse.getHours() != tiemLunchDefault
        ) {
          const horaCita = { timeReal: horas.timeStart };
          this.horaCitaList.push(horaCita);
        }
      });
    } catch (error) {
      console.error('Error al cargar horarios disponibles:', error);
    }
  }

  async getClientByPhone(phone: String) {
    try {
      await this.clientService.getClientByPhone(phone).then((response: any) => {
        if (response.data !== null) {
          this.formulario.patchValue({
            cliente: response.data.name,
          });
        }
        this.loading = false;
      });
    } catch (error) {
      console.error('Error al cargar datos del cliente:', error);
    }
  }

  async saveAppointment() {
    var appointmentCreated: any = [];

    if (this.formulario.valid) {
      this.day = new Date(this.formulario.value.daySelected);
      const hourSelected = new Date(this.formulario.value.horaCita.timeReal);
      this.daySelected = format(this.day, 'yyyy-MM-dd');
      this.horaCitaSelected = format(hourSelected, 'HH:mm:ss');

      const newAppointment = {
        barberId: this.formulario.value.barbero.id,
        timeStart: this.daySelected + 'T' + this.horaCitaSelected,
        canceled: false,
        client: {
          name: this.formulario.value.cliente,
          phone: this.formulario.value.phone,
        },
      };
      try {
        if (this.appointmentDetails) {
          //Se Actualizara el appointment
          appointmentCreated = await this.appoitmentService.updateData(
            newAppointment,
            this.idActualizar
          );
        } else {
          //Se creará un nuevo Appointment
          appointmentCreated = await this.appoitmentService.createData(
            newAppointment
          );
        }
        this.appoitmentService.notificarNuevoRegistro();
        if (!this.appointmentDetails) {
          this.alertAppointmentDetails(appointmentCreated.data);
        }
      } catch (error) {
        console.error('Error al crear cita:', error);
      }
    }
  }

  alertAppointmentDetails(appointmentCreated: any) {
    this.flatAlerta = true;
    this.titulo = 'Detalle de la cita';
    this.barberSelected = appointmentCreated.barber.name;
    this.clientSelected = appointmentCreated.client.name;
    this.daySelected = appointmentCreated.timeStart;
  }

  cerrarDetalleCita() {
    this.flatAlerta = false;
    this.isOpenList= false;
    this.isConsultList = false;
    this.titulo = 'Agendar cita';
    this.barberSelected = '';
    this.formulario.reset({
      cliente: '',
      phone: '',
      daySelected: this.daySelected,
      horaCita: '',
      barbero: '',
    });
  }

  closeForm() {
    this.isOpenForm = false;
    this.flatAlerta = false;
  }
  iraMyAppointment(){
    this.isOpenList = true;
    this.titulo = 'Consultar mis citas';
  }

  nuevaCita(){
    this.isOpenList = false;
    
  }  
  consultarMyAppointment(){
    this.isOpenList = false;
    this.flatAlerta = false;
    this.isConsultList = true;
    this.titulo = 'Mis citas';

  }
  irAWhatsApp(): void {
    window.open(this.urlWhatsApp, '_blank');
  }

  async cancelAppointment(data: any) {
    this.flatAlerta = false;
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
      console.error('Error al eliminar dato:', error);
    }
  }

  // async deleteAppointment(idEliminar: number) {
  //   this.flatAlerta = false;
  //   if (idEliminar !== undefined) {
  //     try {
  //       await this.appoitmentService.deleteData(idEliminar);
  //       // Actualizar la lista de datos después de la eliminación
  //       this.appoitmentService.notificarNuevoRegistro();
  //     } catch (error) {
  //       console.error('Error al eliminar dato:', error);consultarMyAppointment(){
    this.isOpenList = false;
    this.flatAlerta = false;

  }
      this.idActualizar = this.appointmentDetails.id;
      this.barberSelected = this.appointmentDetails.barber;
      this.daySelected = this.appointmentDetails.daySelected;
      this.horaCitaSelected = {
        timeReal: this.appointmentDetails.timeStart,
      };
      this.formulario.get('barbero')?.setValue(this.barberSelected);
      this.formulario.get('horaCita')?.setValue(this.horaCitaSelected);
      this.formulario.patchValue({
        daySelected: this.daySelected,
        cliente: this.appointmentDetails.client.name,
        phone: this.appointmentDetails.client.phone,
      });
    } else {
      this.formulario.patchValue({
        daySelected: (this.daySelected = format(
          this.day,
          "yyyy-MM-dd'T'00:00:00"
        )),
      });
    }
  }
}
