import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { collection, CollectionReference, getDocs } from 'firebase/firestore';
import { FirebaseService } from 'src/firebase/firebase.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';

@Injectable()
export class FeedbackService {

  constructor(private firebaseService: FirebaseService) { }

  public async create(createFeedbackDto: CreateFeedbackDto) {
    try {

      //return await this.createUserFeedback(file)

    } catch (error: unknown) {

      console.warn(`[ERROR]: ${error}`)

      throw new HttpException('Error connecting to Google', HttpStatus.SERVICE_UNAVAILABLE);

    }
  }

  public async findAll() {
    try {

      return await this.getAllFeedbacks()

    } catch (error: unknown) {

      console.warn(`[ERROR]: ${error}`)

      throw new HttpException('Error connecting to Google', HttpStatus.SERVICE_UNAVAILABLE);

    }
  }

  //Util Functions
  private createUserFeedback() {

  }

  private async getAllFeedbacks() {

    const feedbackCollection: CollectionReference = collection(this.firebaseService.firestore, 'feedback');

    const feedbackSnapshot = await getDocs(feedbackCollection);

    const feedback = []

    feedbackSnapshot.forEach(doc => {
      feedback.push(doc.data())
    })

    return feedback
  }
}
