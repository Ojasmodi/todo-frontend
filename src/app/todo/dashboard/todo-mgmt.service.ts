import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class TodoMgmtService {

  private url = 'http://todoback.myinfo.world';
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

  // function to get new friend request
  public getNewFriendRequest = () => {
    return Observable.create((observer) => {
      this.socket.on('new-friend-request', (data) => {
        observer.next(data);
      })
    })
  }

  // function to get new friend
  public getNewFriend = () => {
    return Observable.create((observer) => {
      this.socket.on('new-friend', (data) => {
        observer.next(data);
      })
    })
  }

  // function to get new list when it is created
  public getNewList = () => {
    return Observable.create((observer) => {
      this.socket.on('new-created-list', (data) => {
        observer.next(data);
      })
    })
  }

  // function to get new item when it is created
  public getNewItem = () => {
    return Observable.create((observer) => {
      this.socket.on('new-created-item', (data) => {
        observer.next(data);
      })
    })
  }

  // function to get new subitem when it is created
  public getNewSubItem = () => {
    return Observable.create((observer) => {
      this.socket.on('new-created-subitem', (data) => {
        observer.next(data);
      })
    })
  }

  // function to get new list when it is updated
  public getUpdatedList = () => {
    return Observable.create((observer) => {
      this.socket.on('updated-list', (data) => {
        observer.next(data);
      })
    })
  }

  // function to get new item when it is updated
  public getUpdatedItem = () => {
    return Observable.create((observer) => {
      this.socket.on('updated-item', (data) => {
        observer.next(data);
      })
    })
  }

  // function to get new subitem when it is updated
  public getUpdatedSubItem = () => {
    return Observable.create((observer) => {
      this.socket.on('updated-subitem', (data) => {
        observer.next(data);
      })
    })
  }

  // function to get list when it is deleted
  public getDeletedList = () => {
    return Observable.create((observer) => {
      this.socket.on('deleted-list', (data) => {
        observer.next(data);
      })
    })
  }

  // function to get item when it is deleted
  public getDeletedItem = () => {
    return Observable.create((observer) => {
      this.socket.on('deleted-item', (data) => {
        observer.next(data);
      })
    })
  }

  // function to get subitem when it is deleted
  public getDeletedSubItem = () => {
    return Observable.create((observer) => {
      this.socket.on('deleted-subitem', (data) => {
        observer.next(data);
      })
    })
  }

  // function to get undo-error
  public getUndoError = () => {
    return Observable.create((observer) => {
      this.socket.on('undo-error', (data) => {
        observer.next(data);
      })
    })
  }

  // function to get all friendlist
  public getAllFriendList = () => {
    return this.http.get(`${this.url}/api/v1/friend/getAllFriendList?authToken=${this.cookieService.get('authToken')}`);
  }

  // function to get all todolist
  public getAllList = (id) => {
    return this.http.get(`${this.url}/api/v1/list/getAllList/${id}?authToken=${this.cookieService.get('authToken')}`);
  }

  // function to get all items
  public getAllItems = () => {
    return this.http.get(`${this.url}/api/v1/item/getAllItems?authToken=${this.cookieService.get('authToken')}`);
  }

  // function to notify when connection is lost
  public disconnectedSocket = () => {
    return Observable.create((observer) => {
      this.socket.on("disconnect", () => {
        observer.next();
      });
    });
  }

  // function to emit all events
  public emitEvent = (eventName, data) => {
    this.socket.emit(eventName, data);
  }

  // function to exit socket connection
  public exitSocket = () => {
    this.socket.disconnect();
  }
}

