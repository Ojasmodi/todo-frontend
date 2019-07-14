import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class TodoMgmtService {

  private url = 'http://localhost:3000';
  private socket;

  constructor(public http: HttpClient, private cookieService: CookieService) {
    this.socket = io(this.url);
  }

  // function to verify user
  public verifyUser = () => {
    return Observable.create((observer) => {
      this.socket.on('verifyUser', (data) => {
        observer.next(data);
      })
    })
  }

  // function to get new assignee when it is created
  public getNewFriendRequest = () => {
    return Observable.create((observer) => {
      this.socket.on('new-friend-request', (data) => {
        observer.next(data);
      })
    })
  }

  // function to get new assignee when it is created
  public getNewFriend = () => {
    return Observable.create((observer) => {
      this.socket.on('new-friend', (data) => {
        observer.next(data);
      })
    })
  }

  // function to get new assignee when it is created
  public getNewList = () => {
    return Observable.create((observer) => {
      this.socket.on('new-created-list', (data) => {
        observer.next(data);
      })
    })
  }

  public getNewItem = () => {
    return Observable.create((observer) => {
      this.socket.on('new-created-item', (data) => {
        observer.next(data);
      })
    })
  }

  public getNewSubItem = () => {
    return Observable.create((observer) => {
      this.socket.on('new-created-subitem', (data) => {
        observer.next(data);
      })
    })
  }

  public getUpdatedList = () => {
    return Observable.create((observer) => {
      this.socket.on('updated-list', (data) => {
        observer.next(data);
      })
    })
  }

  public getDeletedList = () => {
    return Observable.create((observer) => {
      this.socket.on('deleted-list', (data) => {
        observer.next(data);
      })
    })
  }

  public getUpdatedItem = () => {
    return Observable.create((observer) => {
      this.socket.on('updated-item', (data) => {
        observer.next(data);
      })
    })
  }

  public getUpdatedSubItem = () => {
    return Observable.create((observer) => {
      this.socket.on('updated-subitem', (data) => {
        observer.next(data);
      })
    })
  }

  public getDeletedItem = () => {
    return Observable.create((observer) => {
      this.socket.on('deleted-item', (data) => {
        observer.next(data);
      })
    })
  }

  public getDeletedSubItem = () => {
    return Observable.create((observer) => {
      this.socket.on('deleted-subitem', (data) => {
        observer.next(data);
      })
    })
  }

  public getUndoError = () => {
    return Observable.create((observer) => {
      this.socket.on('undo-error', (data) => {
        observer.next(data);
      })
    })
  }

  public getAllFriendList = () => {
    return this.http.get(`${this.url}/api/v1/friend/getAllFriendList?authToken=${this.cookieService.get('authToken')}`);
  }

  public getAllList = (id) => {
    return this.http.get(`${this.url}/api/v1/list/getAllList/${id}?authToken=${this.cookieService.get('authToken')}`);
  }

  public getAllItems = () => {
    return this.http.get(`${this.url}/api/v1/item/getAllItems?authToken=${this.cookieService.get('authToken')}`);
  }

  public disconnectedSocket = () => {
    return Observable.create((observer) => {
      this.socket.on("disconnect", () => {
        observer.next();
      });
    });
  }

  public emitEvent = (eventName, data) => {
    this.socket.emit(eventName, data);
  }

  // function to exit socket connection
  public exitSocket = () => {
    this.socket.disconnect();
  }
}

