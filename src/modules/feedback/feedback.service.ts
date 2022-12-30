import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CollectionReference, getDocs, addDoc } from 'firebase/firestore';
import { FirebaseService } from 'src/firebase/firebase.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { getAuth } from 'firebase/auth';

@Injectable()
export class FeedbackService {

  constructor(private firebaseService: FirebaseService) { }

  public async create(createFeedbackDto: CreateFeedbackDto) {
    try {

      return await this.createUserFeedback(createFeedbackDto)

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
  private async createUserFeedback(body: CreateFeedbackDto) {

    const auth = getAuth();

    const user = auth.currentUser;

    body.userid = user.uid

    await addDoc(this.firebaseService.feedbackCollection, body)

  }

  private async getAllFeedbacks() {

    const feedbackCollection: CollectionReference = this.firebaseService.feedbackCollection

    const feedbackSnapshot = await getDocs(feedbackCollection);

    const feedback = []

    feedbackSnapshot.forEach(doc => {
      feedback.push(doc.data())
    })

    return feedback
  }
}
