import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CollectionReference, DocumentReference, updateDoc, doc, query, orderBy, limit, where, getDocs, deleteDoc, setDoc } from 'firebase/firestore';

@Injectable()
export class CommentsService {

  constructor(private firebaseService: FirebaseService) { }

  public async create(createCommentDto: CreateCommentDto): Promise<any> {

    try {

      const user = this.firebaseService.auth.currentUser;

      const commentId = this.getUuid()

      createCommentDto.userId = user.uid;
      createCommentDto.commentId = commentId;

      const userComment: CreateCommentDto = {
        ...createCommentDto
      } as CreateCommentDto;

      const docRef: DocumentReference = doc(this.firebaseService.musicMixCommentsCollection, commentId)

      await setDoc(docRef, userComment)

      return { status: "succes", data: userComment }

    } catch (error: unknown) {

      console.warn(`[ERROR]: ${error}`)

      throw new HttpException('Error connecting to Google', HttpStatus.SERVICE_UNAVAILABLE);

    }

  }

  //this method is for the administrator
  public async findAll(): Promise<any> {

    try {

      const commentsCollection: CollectionReference = this.firebaseService.musicMixCommentsCollection

      const commentsSnapshot = await getDocs(commentsCollection);

      const comments = []

      commentsSnapshot.forEach(doc => {
        comments.push(doc.data())
      })

      return { status: "success", data: comments }

    } catch (error: unknown) {

      console.warn(`[ERROR]: ${error}`)

      throw new HttpException('Error connecting to Google', HttpStatus.SERVICE_UNAVAILABLE);

    }
  }

  public async getMixComments(mixId: string): Promise<any> {

    try {

      const commentsCollectionRef: CollectionReference = this.firebaseService.musicMixCommentsCollection

      const commentsQuery = query(commentsCollectionRef, where("mixItemId", "==", mixId), orderBy("dateCreated"), limit(100));

      const messagesSnapshot = await getDocs(commentsQuery);

      const comments = [];

      messagesSnapshot.forEach(doc => comments.push(doc.data()));

      return { status: "success", data: comments }

    } catch (error: unknown) {

      console.warn(`[ERROR]: ${error}`)

      throw new HttpException('Error connecting to Google', HttpStatus.SERVICE_UNAVAILABLE);

    }
  }

  //get all the comments of one user
  public async findUsersComments() {

    try {

      const user = this.firebaseService.auth.currentUser;

      const commentsCollectionRef: CollectionReference = this.firebaseService.musicMixCommentsCollection

      const commentsQuery = query(commentsCollectionRef, where("userId", "==", user.uid), orderBy("dateCreated"), limit(100));

      const messagesSnapshot = await getDocs(commentsQuery);

      const comments = [];

      messagesSnapshot.forEach(doc => comments.push(doc.data()));

      return { status: "success", data: comments }


    } catch (error: unknown) {

      console.warn(`[ERROR]: ${error}`)

      throw new HttpException('Error connecting to Google', HttpStatus.SERVICE_UNAVAILABLE);

    }
  }

  public async update(updateCommentDto: UpdateCommentDto) {

    try {

      const docRefUsersDetails: DocumentReference = doc(this.firebaseService.musicMixCommentsCollection, updateCommentDto.commentId);

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

      return { status: "success", data: "Comment deleted successfully" }

    } catch (error: unknown) {

      console.warn(`[ERROR]: ${error}`)

      throw new HttpException('Error connecting to Google', HttpStatus.SERVICE_UNAVAILABLE);

    }
  }

  public async disableComment(updateCommentDto: UpdateCommentDto): Promise<any> {

    try {

      const docRefUsersDetails: DocumentReference = doc(this.firebaseService.musicMixCommentsCollection, updateCommentDto.commentId);

      await updateDoc(docRefUsersDetails, {
        ...updateCommentDto
      });

      return { status: "success", msg : "Comment has been "+updateCommentDto.status }

    } catch (error: unknown) {

      console.warn(`[ERROR]: ${error}`)

      throw new HttpException('Error connecting to Google', HttpStatus.SERVICE_UNAVAILABLE);

    }

  }

  //Utill functions to be used
  private getUuid(): string {
    let uuuu = Math.random().toString(32).slice(-4);
    let wwww = Math.random().toString(32).slice(-4);
    let xxxx = Math.random().toString(32).slice(-4);
    let yyyy = Math.random().toString(32).slice(-4);
    let zzzz = Math.random().toString(32).slice(-4);

    const uid: string = wwww + xxxx + yyyy + zzzz + uuuu;

    return uid
  }
}
