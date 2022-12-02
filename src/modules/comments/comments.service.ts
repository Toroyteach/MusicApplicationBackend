import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { getAuth } from 'firebase/auth';
import { collection, CollectionReference, DocumentReference, updateDoc, doc, addDoc, query, orderBy, limit, where, getDocs, deleteDoc } from 'firebase/firestore';

@Injectable()
export class CommentsService {

  constructor(private firebaseService: FirebaseService) { }

  public async create(createCommentDto: CreateCommentDto): Promise<any> {

    try {

      const auth = getAuth();

      const user = auth.currentUser;

      createCommentDto.userId = user.uid;

      const userComment: CreateCommentDto = {
        ...createCommentDto
      } as CreateCommentDto;

      await addDoc(this.firebaseService.musicMixCommentsCollection, userComment)

      return { status: "succes", data: userComment }

    } catch (error: unknown) {

      console.warn(`[ERROR]: ${error}`)

      throw new HttpException('Error connecting to Google', HttpStatus.SERVICE_UNAVAILABLE);

    }

  }

  public async getMixComments(mixId: string): Promise<any> {

    try {

      const commentsCollectionRef: CollectionReference = collection(this.firebaseService.firestore, 'comments');

      const commentsQuery = query(commentsCollectionRef, where("mixItemId", "==", mixId), orderBy("dateCreated"), limit(100));

      const messagesSnapshot = await getDocs(commentsQuery);

      const comments = [];

      messagesSnapshot.forEach(doc => comments.push(doc.data()));

      return { status: "succes", data: comments }

    } catch (error: unknown) {

      console.warn(`[ERROR]: ${error}`)

      throw new HttpException('Error connecting to Google', HttpStatus.SERVICE_UNAVAILABLE);

    }
  }

  //this method is for the administrator
  public async findAll(): Promise<any> {
    try {

      const commentsCollection: CollectionReference = collection(this.firebaseService.firestore, 'comments');

      const commentsSnapshot = await getDocs(commentsCollection);

      const comments = []

      commentsSnapshot.forEach(doc => {
        comments.push(doc.data())
      })

      return { status: "succes", data: comments }

    } catch (error: unknown) {

      console.warn(`[ERROR]: ${error}`)

      throw new HttpException('Error connecting to Google', HttpStatus.SERVICE_UNAVAILABLE);

    }
  }

  //get all the comments of one user
  public async findUsersComments(id: string) {

    try {


    } catch (error: unknown) {

      console.warn(`[ERROR]: ${error}`)

      throw new HttpException('Error connecting to Google', HttpStatus.SERVICE_UNAVAILABLE);

    }
  }

  public async update(id: string, updateCommentDto: UpdateCommentDto) {
    try {

      const docRefUsersDetails: DocumentReference = doc(this.firebaseService.musicMixCommentsCollection, id);

      await updateDoc(docRefUsersDetails, {
        ...updateCommentDto
      });

      return { status: "succes", data: updateCommentDto }

    } catch (error: unknown) {

      console.warn(`[ERROR]: ${error}`)

      throw new HttpException('Error connecting to Google', HttpStatus.SERVICE_UNAVAILABLE);

    }
  }

  public async remove(id: string) {
    try {

      const docRefUsersComments: DocumentReference = doc(this.firebaseService.musicMixCommentsCollection, id);

      await deleteDoc(docRefUsersComments)

      return { status: "succes", data: "Comment deleted successfully" }

    } catch (error: unknown) {

      console.warn(`[ERROR]: ${error}`)

      throw new HttpException('Error connecting to Google', HttpStatus.SERVICE_UNAVAILABLE);

    }
  }
}
