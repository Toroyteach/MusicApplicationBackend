import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { collection, CollectionReference, addDoc, serverTimestamp, onSnapshot, query, limit, where, orderBy, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { FirebaseService } from 'src/firebase/firebase.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';

@Injectable()
export class ChatsService {

  constructor(private firebaseService: FirebaseService) { }


  public async create(createChatDto: CreateChatDto): Promise<any> {

    try {

      const auth = getAuth();

      const user = auth.currentUser;

      createChatDto.userId = user.uid;

      //TODO: create userimage and details refreence in the DTO
      const userChat: CreateChatDto = {
        ...createChatDto
      } as CreateChatDto;

      const docRef: CollectionReference = collection(this.firebaseService.usersMessagesCollection, createChatDto.roomId, 'usersMessages')

      await addDoc(docRef, userChat)

      throw new HttpException("Message created Succesfully", HttpStatus.OK);

    } catch (error: unknown) {

      throw new HttpException('Error connecting to Google', HttpStatus.SERVICE_UNAVAILABLE);

    }
  }

  //get all the messages of a room
  //TODO: limit the query to daily
  public async findRoom(id: any): Promise<any> {

    try {

      const roomId = id.roomId;

      const messagesCollectionRef: CollectionReference = collection(this.firebaseService.firestore, 'messages', roomId + '/usersMessages');

      const messageQuery = query(messagesCollectionRef, orderBy("timestamp"), limit(100));

      const messagesSnapshot = await getDocs(messageQuery);

      const roomsMessages = []

      messagesSnapshot.forEach(doc => {
        roomsMessages.push(doc.data())
      })

      return roomsMessages

      //throw new HttpException(roomsMessages, HttpStatus.OK);

    } catch (error: unknown) {

      throw new HttpException('Error connecting to Google', HttpStatus.SERVICE_UNAVAILABLE);

    }

  }

  //return list of all available rooms
  public async getAllRooms(): Promise<any> {

    try {

      const messagesCollection: CollectionReference = collection(this.firebaseService.firestore, 'messages');

      const messagesSnapshot = await getDocs(messagesCollection);

      const chatRooms = []

      messagesSnapshot.forEach(doc => {
        chatRooms.push(doc.data())
      })

      return chatRooms

    } catch (error: unknown) {

      throw new HttpException('Error connecting to Google', HttpStatus.SERVICE_UNAVAILABLE);

    }

  }

  findOne(id: number) {
    return `This action returns a #${id} chatr`;
  }

  update(id: number, updateChatDto: UpdateChatDto) {
    return `This action updates a #${id} chatuu`;
  }

  remove(id: number) {
    return `This action removes a #${id} chatd`;
  }
}
