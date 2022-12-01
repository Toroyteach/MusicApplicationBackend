import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateRatingDto } from './dto/create-rating.dto';
import { CreateUserRatingDto } from './dto/create-userRating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { DocumentReference, doc, setDoc, updateDoc, DocumentSnapshot, DocumentData, getDoc } from 'firebase/firestore';
import { FirebaseService } from 'src/firebase/firebase.service';

@Injectable()
export class RatingsService {

  constructor(private firebaseService: FirebaseService) { }

  public async create(createRatingDto: CreateRatingDto): Promise<any> {

    try {

      return await this.createUserRating(createRatingDto);

    } catch (error: unknown) {

      console.warn(`[ERROR]: ${error}`)

      throw new HttpException('Error connecting to Google', HttpStatus.SERVICE_UNAVAILABLE);

    }

  }

  public async findOne(getRatingDto: CreateRatingDto) {
    try {

      return await this.getUserRating(getRatingDto);

    } catch (error: unknown) {

      console.warn(`[ERROR]: ${error}`)

      throw new HttpException('Error connecting to Google', HttpStatus.SERVICE_UNAVAILABLE);

    }
  }

  public async update(updateRatingDto: UpdateRatingDto) {
    try {

      return await this.updateUserRating(updateRatingDto);

    } catch (error: unknown) {

      console.warn(`[ERROR]: ${error}`)

      throw new HttpException('Error connecting to Google', HttpStatus.SERVICE_UNAVAILABLE);

    }
  }

  //util functions
  private createUserRating(payload: CreateRatingDto) {
    const id: string = payload.userId;
    const mixId: string = payload.mixId

    const docRef: DocumentReference = doc(this.firebaseService.mixItemsCollection, mixId, 'usersRatings', id)

    const userRatings: CreateUserRatingDto = {
      rating: payload.rating,
      userId: payload.userId,
    }

    setDoc(docRef, userRatings)
  }

  private async getUserRating(payload: CreateRatingDto) {

    const id: string = payload.userId
    const mixId: string = payload.mixId

    const docRefUsersRatings: DocumentReference = doc(this.firebaseService.mixItemsCollection, mixId, 'usersRatings', id);

    const snapshotUsersRatings: DocumentSnapshot<DocumentData> = await getDoc(docRefUsersRatings);

    const userRating = {
      userRating: snapshotUsersRatings.data(),
    }

    return userRating;

  }

  private updateUserRating(payload: UpdateRatingDto) {
    const id: string = payload.userId;
    const mixId: string = payload.mixId

    const docRef: DocumentReference = doc(this.firebaseService.mixItemsCollection, mixId, 'usersRatings', id)

    const userRatings: CreateUserRatingDto = {
      rating: payload.rating,
      userId: payload.userId,
    }

    updateDoc(docRef, {
      userRatings
    })
  }
}
