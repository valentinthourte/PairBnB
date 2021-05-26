import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Place } from './places.model';
import { take, map, tap, delay, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { PlaceLocation } from './location.model';

interface PlaceData {
  availableFrom: string;
  availableTo: string;
  description: string;
  imageUrl: string;
  price: number;
  title: string;
  userId: string;
  location: PlaceLocation,
}

/* [
  new Place('p1', 'Monoambiente Recoleta', 'Departamento individual bien posicionado', 'https://cf.bstatic.com/images/hotel/max1024x768/931/93173705.jpg', 15000, new Date('2021-04-21'), new Date("2021-12-31"), 'u1'),
  new Place('p2', 'Casa caballito', "Casa familiar en zona tranquila", "https://imgar.zonapropcdn.com/avisos/1/00/44/92/35/97/720x532/1700456874.jpg", 20000, new Date('2022-01-01'), new Date("2022-12-31"), 'u2'),
  new Place('p3', 'Hotel San miguel', "Hotel 5 estrellas frente a la laguna", "https://media-cdn.tripadvisor.com/media/photo-s/03/3e/d7/11/hosteria-las-piedras.jpg", 2500, new Date('2021-04-21'), new Date("2025-12-31"), 'u31')
] */


@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  private placesList = new BehaviorSubject<Place[]>([]);
  databaseUrl: string = "https://ionic-angular-course-a374f-default-rtdb.firebaseio.com/offered-places";
  constructor(private authService: AuthService, private http: HttpClient) { }
  editList: Place[];
  wasFound = false;
  pos: number = 0;
  getPlaces() {
    return this.placesList.asObservable();
  }

  getPlace(id: string) {
    return this.authService.getToken().pipe(take(1), switchMap(token => {
      return this.http.get<PlaceData>(this.databaseUrl + "/" + id + ".json" + `?auth=${token}`);
    }), map(placeData => {
      return new Place(id, placeData.title, placeData.description, placeData.imageUrl, placeData.price, new Date(placeData.availableFrom), new Date(placeData.availableTo), placeData.userId, placeData.location);
    }));
  }

  uploadImage(image: File) {
    const uploadData = new FormData();
    uploadData.append('image', image);
    return this.authService.getToken().pipe(switchMap(token => {
      return this.http.post<{imageUrl: string, imagePath: string}>(
        'https://us-central1-ionic-angular-course-a374f.cloudfunctions.net/storeImage', uploadData, {headers: {Authorization: "Bearer " + token}});
    }))

  }

  addPlace(title: string, description: string, price: number, dateFrom: Date, dateTo: Date, location: PlaceLocation, imageUrl: string) {
    let generatedId: string;
    let fetchedUserId: string;
    let newPlace: Place;
    return this.authService.getUserId().pipe(take(1), switchMap(userId => {
      if (typeof(userId) === "string") {
        fetchedUserId = userId;
      }
      return this.authService.getToken();
    }),take(1), switchMap(token => {
      if (!fetchedUserId) {
        throw new Error("No user found!");
      }
      if (typeof(fetchedUserId) === 'string') {
        newPlace = new Place(Math.random().toString(), title, description, imageUrl, price, dateFrom, dateTo, fetchedUserId, location);
      }
      return this.http.post<{name: string}>(`https://ionic-angular-course-a374f-default-rtdb.firebaseio.com/offered-places.json?auth=${token}`, { ...newPlace, id: null})
    }), switchMap(resData => {
      generatedId = resData.name;
      return this.placesList;
    }), take(1),
    tap(places => {
      newPlace.id = generatedId;
      this.placesList.next(places.concat(newPlace));
    }));
  }

  fetchPlaces() {
    return this.authService.getToken().pipe(take(1), switchMap(token => {
      return this.http
    .get<{[key: string]: PlaceData}>(`https://ionic-angular-course-a374f-default-rtdb.firebaseio.com/offered-places.json?auth=${token}`)
    }), map(resData => {
      const places = [];
      for (const key in resData) {
        if (resData.hasOwnProperty(key)) {
          places.push(new Place(key,
            resData[key].title,
            resData[key].description,
            resData[key].imageUrl,
            resData[key].price,
            new Date(resData[key].availableFrom),
            new Date(resData[key].availableTo),
            resData[key].userId, resData[key].location));
        }
      }
      return places;
    }),
    tap(places => {
      this.placesList.next(places);
    }));
  }
  editPlace(id: string, title: string, description: string) {
    let updatedPlaces: Place[];
    let fetchedToken: string;
    return this.authService.getToken().pipe(take(1), switchMap(token => {
      if (typeof(token) === "string") {
        fetchedToken = token;
      }
      return this.placesList;
    }), take(1), switchMap(places => {
      if (!places || places.length <= 0) {
        return this.fetchPlaces();
      }
      else {
        return of(places);
      }}), switchMap(places => {
        const updatedPlaceIndex = places.findIndex(pl => pl.id === id);
        updatedPlaces = [...places];
        const oldPlace = updatedPlaces[updatedPlaceIndex];
        updatedPlaces[updatedPlaceIndex] = new Place(oldPlace.id,
        title,
        description,
        oldPlace.imageUrl,
        oldPlace.price,
        oldPlace.availableFrom,
        oldPlace.availableTo,
        oldPlace.userId, oldPlace.location);
        return this.http.put((this.databaseUrl + "/" + id + ".json" + `?auth=${fetchedToken}`),
        {...updatedPlaces[updatedPlaceIndex], id: null});
      }), tap(() =>{
      this.placesList.next(updatedPlaces);
    }))
    return this.placesList.pipe(

    )

  }

}
