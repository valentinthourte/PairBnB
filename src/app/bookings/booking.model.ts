export class Booking {
  constructor(
    public id: string,
    public placeId: string,
    public userId: string,
    public firstName: string,
    public lastName: string,
    public bookedFrom: Date,
    public bookedTo: Date,
    public guestNumber: number
    ) {}

}
