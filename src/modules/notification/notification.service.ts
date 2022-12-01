import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { addDoc } from 'firebase/firestore';

@Injectable()
export class NotificationService {

  constructor(private firebaseService: FirebaseService) { }


  public async create(createNotificationDto: CreateNotificationDto): Promise<any> {
    try {

      return await this.createNotification(createNotificationDto);

    } catch (error: unknown) {

      console.warn(`[ERROR]: ${error}`)

      throw new HttpException('Error connecting to Google', HttpStatus.SERVICE_UNAVAILABLE);

    }
  }

  findAll() {
    return `This action returns all notification`;
  }

  findOne(id: number) {
    return `This action returns a #${id} notification`;
  }

  update(id: number, updateNotificationDto: UpdateNotificationDto) {
    return `This action updates a #${id} notification`;
  }

  remove(id: number) {
    return `This action removes a #${id} notification`;
  }

  //util functions
  private createNotification(notificationData) {

    addDoc(this.firebaseService.notificationCollection, notificationData)

  }
}
