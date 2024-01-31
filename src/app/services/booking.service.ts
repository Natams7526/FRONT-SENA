import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  //apiUrl = 'https://6566a13664fcff8d730eebb1.mockapi.io/api/barbers';
  apiUrl = environment.apiUrl + environment.port + environment.path.apointment;

  // >>>>>>>>>>>>  Metodo traer toda la data
  async getData(filtro: any): Promise<any> {
    const path = this.apiUrl + '/BookingDate';
    const queryParams = new URLSearchParams(filtro).toString();
    const urlWithParams = `${path}?${queryParams}`;
    const response = await fetch(urlWithParams, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`Error al obtener datos: ${response.statusText}`);
    }
    return response.json();
  }

  //metodo para traer la agenda de un barbero por dia
  async getAppointmentsByBarberId(data: any): Promise<any> {
    const path = this.apiUrl + '/getAppointmentsByBarberId';

    const headers = { 'Content-Type': 'application/json' };
    const body = JSON.stringify(data);
    const options = {
      method: 'POST',
      headers: headers,
      body: body,
    };

    const response = await fetch(path, options);
    if (!response.ok) {
      throw new Error(`Error al obtener datos: ${response.statusText}`);
    }
    return response.json();
  }

  // >>>>>>>>>>>>  Metodo traer Especifico registro por id
  async getDataById(id: number): Promise<any> {
    const url = `${this.apiUrl}/${id}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error al obtener datos por ID: ${response.statusText}`);
    }
    return response.json();
  }

  // >>>>>>>>>>>>  Metodo Guardar un registro
  async saveData(barberNew: any): Promise<any> {
    const data = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(barberNew),
    });
    return await data.json();
  }

  // >>>>>>>>>>>>  Metodo Crear un registro

  async createData(data: any): Promise<any> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Error al crear datos: ${response.statusText}`);
    }
    return response.json();
  }

  // >>>>>>>>>>>>  Metodo updateData un registro

  async updateData(updatedData: any, idActualizar: number): Promise<any> {
    const url = `${this.apiUrl}/` + idActualizar;
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedData),
    });
    if (!response.ok) {
      throw new Error(`Error al actualizar datos: ${response.statusText}`);
    }
    return response.json();
  }

  // >>>>>>>>>>>>  Metodo deleteData un registro

  async cancelAppointment(data: any, id: number): Promise<void> {
    const url = `${this.apiUrl}/${id}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Error cancelando cita: ${response.statusText}`);
    }
  }

  private nuevoRegistroSubject = new Subject<void>();

  nuevoRegistro$ = this.nuevoRegistroSubject.asObservable();

  notificarNuevoRegistro(): void {
    this.nuevoRegistroSubject.next();
  }
}
