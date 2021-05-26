import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { delay, take, tap, switchMap, map } from "rxjs/operators";
import { AuthService } from "../auth/auth.service";
import { PlacesService } from "../places/places.service";
import { Booking } from "./booking.model";
import { HttpClient } from "@angular/common/http";


interface BookingData {
  firstName: string;
  lastName: string;
  placeId: string;
  dateFrom: string;
  dateTo: string;
  amountOfGuests: number;
  userId: string;
}


@Injectable({providedIn: 'root'})
export class BookingService {
  private bookings = new BehaviorSubject<Booking[]>([]);
  constructor (private authService: AuthService, private placesService: PlacesService, private http: HttpClient) {}
  getBookings() {
    return this.bookings.asObservable();
  }

  addBooking(placeId: string, firstName: string, lastName: string, guestNumber: number, dateFrom: Date, dateTo: Date) {
    let generatedId;
    let fetchedUserId: string;
    let newBooking: Booking;
    return this.authService.getUserId().pipe(take(1), switchMap(userId => {
      if (!userId) {
        throw new Error('No user id found');
      }
      if (typeof(userId) === "string") {
        fetchedUserId = userId;
      }
      return this.authService.getToken();
    }), take(1), switchMap(token => {
        newBooking = new Booking(Math.random().toString(), placeId, fetchedUserId, firstName, lastName, dateFrom, dateTo, guestNumber);
        return this.http.post<{name: string}>(`https://ionic-angular-course-a374f-default-rtdb.firebaseio.com/your-bookings.json?auth=${token}`, {...newBooking, id: null});
    }), take(1), switchMap(resData => {
      generatedId = resData.name;
      return this.bookings;
    }), take(1), tap(bookings => {
      newBooking.id = generatedId;
      this.bookings.next(bookings.concat(newBooking));
    }));
  }

  cancelBooking(bookingId: string) {
    let fetchedUserId;
    return this.authService.getToken().pipe(take(1), switchMap(token => {
      return this.http.delete(`https://ionic-angular-course-a374f-default-rtdb.firebaseio.com/your-bookings/${bookingId}.json?auth=${token}`);
    }), take(1), switchMap(() => {
      return this.bookings;
    }), take(1), tap(bookings => {
      this.bookings.next(bookings.filter(b => b.id !== bookingId));
    }));
  }

  fetchBookings() {
    let fetchedUserId: string;
    return this.authService.getUserId().pipe(take(1), switchMap(userId => {
      if (!userId) {
        throw new Error("No user found");
      }
      if (typeof(userId) === "string") {
        fetchedUserId = userId;
      }
      return this.authService.getToken();
    }), take(1), switchMap(token => {
      return this.http.get<{[key: string]: BookingData}>(`https://ionic-angular-course-a374f-default-rtdb.firebaseio.com/your-bookings.json?orderBy="userId"&equalTo="${fetchedUserId}"&auth=${token}`)
    }), map(resData => {
      const bookings = [];
      for (const key in resData) {
        if (resData.hasOwnProperty(key)) {
          bookings.push(new Booking(
            key,
            resData[key].placeId,
            resData[key].userId,
            resData[key].firstName,
            resData[key].lastName,
            new Date(resData[key].dateFrom),
            new Date(resData[key].dateTo),
            resData[key].amountOfGuests
          ));
        }
      }
      return bookings;
    }), tap(bookings => {
      this.bookings.next(bookings);
    }))
  }


}
