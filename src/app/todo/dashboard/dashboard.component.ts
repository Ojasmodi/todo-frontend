import { Component, OnInit } from '@angular/core';
import { UserMgmtService } from 'src/app/user-mgmt.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { TodoMgmtService } from './todo-mgmt.service'
declare let $: any

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  providers: [TodoMgmtService]
})

export class DashboardComponent implements OnInit {
  public authToken: any;
  public userInfo: any;
  public userId: any;
  public userName: any;
  public title: any;
  public friendDetails: any;
  toBeEditedText
  itemName
  subItemName
  listName
  selectedList
  selectedItem
  selectedSubItem
  item_subitem
  mark = 'open'
  isList = false;
  selectedFriend = null
  allLists = []
  allItems = []
  allUsers = [];
  friends = [];
  friendsPending = []
  friendRequest = [];
  liveConSubs
  deletedListSubs
  deletedItemSubs
  deletedSubItemSubs
  getNewSubItemSubs
  getNewItemSubs
  getNewListSubs
  updatedListSubs
  updatedItemSubs
  updatedSubItemSubs
  getNewFriendRequestSubs
  getNewFriendSubs
  undoSubs
  conSubs
  disconnectedSocket = true;

  constructor(public toastrService: ToastrService, public router: Router, private spinner: NgxSpinnerService,
    public userManagementService: UserMgmtService, public cookieService: CookieService,
    public todoService: TodoMgmtService) {
  }

  ngOnInit() {
    this.authToken = this.cookieService.get('authToken');
    this.userId = this.cookieService.get('userId');
    this.userName = this.cookieService.get('userName');
    this.userInfo = this.userManagementService.getUserInfoFromLocalStorage();
    this.spinner.show();
    this.checkStatus();
    this.verifyUserConfirmation()
    this.getNewFriendRequest();
    this.getNewFriend();
    this.getNewList();
    this.getNewSubItem();
    this.getNewItem();
    this.getDeletedList();
    this.getDeletedItem();
    this.getDeletedSubItem();
    this.getUpdatedList();
    this.getUpdatedItem();
    this.getUpdatedSubItem();
    this.getUndoError();
    this.callDisconnectedSocket();
  }

  // function to get all users
  getAllUsers = () => {
    this.allUsers = []
    this.friendRequest = []
    this.friends = []
    this.userManagementService.getAllUsers().subscribe((apiResponse) => {
      if (apiResponse['status'] === 200) {
        this.allUsers = apiResponse.data;
        this.todoService.getAllFriendList().subscribe((apiResponse) => {
          if (apiResponse['status'] === 200) {
            this.friendsPending = apiResponse['data'];
            // console.log(this.friendsPending)
            this.seperateRequestAndFriendsForCurrentUser(this.friendsPending);
          }
        },
          (err) => {
            this.toastrService.error("Network problem.")
          }
        );
      }
    });
  }

  // function to get all todo lists of particular user
  getAllLists = (userId) => {
    this.allLists = []
    this.todoService.getAllList(userId).subscribe((apiResponse) => {
      if (apiResponse['status'] === 200) {
        this.allLists = apiResponse['data'];
      }
      else if (apiResponse['status'] == 404) {
        this.allLists = []
        this.toastrService.info("No list found.")
      }
    },
      (err) => {
        this.toastrService.error("Network problem.")
      }
    );
  }

  // function to get all items and subitems
  getAllItems = () => {
    this.todoService.getAllItems().subscribe((apiResponse) => {
      if (apiResponse['status'] === 200) {
        this.allItems = apiResponse['data'];
      }
    });
  }

  // event for getting deleted list
  getDeletedList = () => {
    this.deletedListSubs = this.todoService.getDeletedList().subscribe((apiResponse) => {
      if (apiResponse.status == 200) {
        let createdByUserId = apiResponse.data.listCreatorId;
        let deletedByUserName = apiResponse.deletedBy;
        if (this.isFriend(createdByUserId) || createdByUserId == this.userId) {
          this.toastrService.show(`${deletedByUserName} deleted the list named ${apiResponse.data.listName}`)
        }
        this.modifyList(apiResponse.data, 'delete');
      }
      else if (this.userId == apiResponse.deletedBy) {
        if (apiResponse.status == 404) {
          this.toastrService.error("Error while deleting list")
          this.router.navigate(['/notfound']);
        }
        else if (apiResponse.status == 500) {
          this.toastrService.error("Error while deleting list")
          this.router.navigate(['/servererror']);
        }
      }
    })
  }

  // event for getting deleted item
  getDeletedItem = () => {
    this.deletedItemSubs = this.todoService.getDeletedItem().subscribe((apiResponse) => {
      if (apiResponse.status == 200) {
        let createdByUserId = apiResponse.data.itemCreatorId;
        let deletedByUserName = apiResponse.deletedBy;
        if (this.isFriend(createdByUserId) || createdByUserId == this.userId) {
          this.toastrService.show(`${deletedByUserName} deleted the item named ${apiResponse.data.itemName}`)
        }
        this.modifyItem(apiResponse.data, 'delete');
      }
      else if (this.userId == apiResponse.deletedBy) {
        if (apiResponse.status == 404) {
          this.toastrService.error("Error while deleting item")
          this.router.navigate(['/notfound']);
        }
        else if (apiResponse.status == 500) {
          this.toastrService.error("Error while deleting item")
          this.router.navigate(['/servererror']);
        }
      }
    })
  }

  // event for getting deleted subitem
  getDeletedSubItem = () => {
    this.deletedSubItemSubs = this.todoService.getDeletedSubItem().subscribe((apiResponse) => {
      // // console.log(apiResponse)
      if (apiResponse.status == 200) {
        let createdByUserId = apiResponse.data.subItemCreatorId;
        let deletedByUserName = apiResponse.deletedBy;
        if (this.isFriend(createdByUserId) || createdByUserId == this.userId) {
          this.toastrService.show(`${deletedByUserName} deleted the subitem named ${apiResponse.data.subItemName}`)
        }
        this.modifySubItem(apiResponse.data, 'delete');
      }
      else if (this.userId == apiResponse.deletedBy) {
        if (apiResponse.status == 404) {
          this.toastrService.error("Error while deleting subItem")
          this.router.navigate(['/notfound']);
        }
        else if (apiResponse.status == 500) {
          this.toastrService.error("Error while deleting subItem")
          this.router.navigate(['/servererror']);
        }
      }
    })
  }

  // function to change UI based on list
  modifyList = (data, op) => {

    if (op == 'delete') {
      for (let u of this.allLists) {
        if (u.listId == data.listId) {
          let removeIndex = this.allLists.map(function (list) { return list.listId; }).indexOf(u.listId);
          this.allLists.splice(removeIndex, 1)
        }
      }
    }
    else {
      for (let u of this.allLists) {
        if (u.listId == data.listId) {
          u.listName = data.listName;
          u.listModifierId = data.modifiedByUserId;
          u.listModifierName = data.modifiedByUserName
        }
      }
    }
  }

  // function to change UI based on subitem
  modifySubItem = (data, op) => {
    if (op == 'delete') {
      for (let item of this.allItems) {
        for (let subitem of item.subItems) {
          if (subitem.subItemId == data.subItemId) {
            let removeIndex = item.subItems.map(function (ite) { return ite.subItemId; }).indexOf(subitem.subItemId);
            item.subItems.splice(removeIndex, 1)
          }
        }
      }
    }
    else {
      for (let item of this.allItems) {
        for (let subitem of item.subItems) {
          if (subitem.subItemId == data.subItemId) {
            subitem.subItemName = data.subItemName;
            subitem.subItemDone = data.subItemDone;
            subitem.subItemModifierId = data.subItemModifierId;
            subitem.subItemModifierName = data.subItemModifierName
          }
        }
      }
    }

  }

  // function to change UI based on item
  modifyItem = (data, op) => {
    if (op == 'delete') {
      for (let u of this.allItems) {
        if (u.itemId == data.itemId) {
          let removeIndex = this.allItems.map(function (item) { return item.itemId; }).indexOf(u.itemId);
          this.allItems.splice(removeIndex, 1)
        }
      }
    }
    else {
      for (let u of this.allItems) {
        if (u.itemId == data.itemId) {
          u.itemName = data.itemName;
          u.itemDone = data.itemDone;
          u.itemModifierId = data.itemModifierId;
          u.itemModifierId = data.itemModifierId
        }
      }
    }
  }

  // event to get new subitem
  getNewSubItem = () => {
    this.getNewSubItemSubs = this.todoService.getNewSubItem().subscribe((apiResponse) => {
      // // console.log(apiResponse)
      this.item_subitem = '';
      if (apiResponse.status == 200) {
        let createdByUserId = apiResponse.data.subItemCreatorId;
        let createdByUserName = apiResponse.data.subItemCreatorName;
        if (this.userId == createdByUserId) {
          $('#addModal').modal('hide');
        }
        if (apiResponse.data.undo == true && (apiResponse.data.changeDoneById == this.userId || this.isFriend(apiResponse.data.changeDoneById))) {
          // console.log("undo")
          this.toastrService.show(`${apiResponse.data.changeDoneById == this.userId ? 'You' : apiResponse.data.changeDoneByName} made an undo change.`)
        }
        else if (this.isFriend(createdByUserId) || createdByUserId == this.userId) {
          this.toastrService.show(`${createdByUserName} created a new subitem ${apiResponse.data.subItemName}`)
        }
        this.addNewSubItem(apiResponse.data);
      }
      else if (this.userId == apiResponse.data.subItemCreatorId) {
        if (apiResponse.status == 404) {
          this.toastrService.error("Error while creating new subitem.")
          this.router.navigate(['/notfound']);
        }
        else if (apiResponse.status == 500) {
          this.toastrService.error("Error while creating new subitem.")
          this.router.navigate(['/servererror']);
        }
      }
    })
  }

  // event to get new item
  getNewItem = () => {
    this.getNewItemSubs = this.todoService.getNewItem().subscribe((apiResponse) => {
      // // console.log(apiResponse)
      this.item_subitem = '';
      if (apiResponse.status == 200) {
        let createdByUserId = apiResponse.data.itemCreatorId;
        let createdByUserName = apiResponse.data.itemCreatorName;
        if (this.userId == createdByUserId) {
          $('#addModal').modal('hide');
        }
        if (apiResponse.data.undo == true && (apiResponse.data.changeDoneById == this.userId || this.isFriend(apiResponse.data.changeDoneById))) {
          // console.log("undo")
          this.toastrService.show(`${apiResponse.data.changeDoneById == this.userId ? 'You' : apiResponse.data.changeDoneByName} made an undo change.`)
        }
        else if (this.isFriend(createdByUserId) || createdByUserId == this.userId) {
          this.toastrService.show(`${createdByUserName} created a new item ${apiResponse.data.itemName}`)
        }
        this.addNewItem(apiResponse.data);
      }
      else if (this.userId == apiResponse.data.ItemCreatorId) {
        if (apiResponse.status == 404) {
          this.toastrService.error("Error while creating new Item.")
          this.router.navigate(['/notfound']);
        }
        else if (apiResponse.status == 500) {
          this.toastrService.error("Error while creating new Item.")
          this.router.navigate(['/servererror']);
        }
      }
    })
  }

  // function to check whether user is a friend or current user or not
  isFriend = (createdByUserId) => {
    for (let friend of this.friends) {
      if (friend.friendId == createdByUserId)
        return true;
    }
    return false;
  }

  // event for getting updated list
  getUpdatedList = () => {
    this.updatedListSubs = this.todoService.getUpdatedList().subscribe((apiResponse) => {
      // // console.log(apiResponse)
      if (apiResponse.status == 200) {
        let modifiedByUserId = apiResponse.data.listModifierId;
        let modifiedByUserName = apiResponse.data.listModifierName;
        if (this.userId == modifiedByUserId) {
          $('#exampleModalCenter').modal('hide');
        }
        if (this.isFriend(modifiedByUserId) || modifiedByUserId == this.userId) {
          this.toastrService.show(`${modifiedByUserName} updated the list ${apiResponse.data.listName}`)
        }
        this.modifyList(apiResponse.data, 'modify');
      }
      else if (this.userId == apiResponse.data.listModifierId) {
        if (apiResponse.status == 404) {
          this.toastrService.error("Error while updating list.")
          this.router.navigate(['/notfound']);
        }
        else if (apiResponse.status == 500) {
          this.toastrService.error("Error while updating list.")
          this.router.navigate(['/servererror']);
        }
      }
    })
  }

  // event for getting updated item
  getUpdatedItem = () => {
    this.updatedItemSubs = this.todoService.getUpdatedItem().subscribe((apiResponse) => {
      // // console.log(apiResponse)
      if (apiResponse.status == 200) {
        let modifiedByUserId = apiResponse.data.itemModifierId;
        let modifiedByUserName = apiResponse.data.itemModifierName;
        if (this.userId == modifiedByUserId) {
          $('#exampleModalCenter').modal('hide');
        }
        if (this.isFriend(modifiedByUserId) || modifiedByUserId == this.userId) {
          this.toastrService.show(`${modifiedByUserName} updated the item ${apiResponse.data.itemName}`)
        }
        this.modifyItem(apiResponse.data, 'modify');
      }
      else if (this.userId == apiResponse.data.itemModifierId) {
        if (apiResponse.status == 404) {
          this.toastrService.error("Error while updating item.")
          this.router.navigate(['/notfound']);
        }
        else if (apiResponse.status == 500) {
          this.toastrService.error("Error while updating item.")
          this.router.navigate(['/servererror']);
        }
      }
    })
  }

  // event for getting updated subitem
  getUpdatedSubItem = () => {
    this.updatedSubItemSubs = this.todoService.getUpdatedSubItem().subscribe((apiResponse) => {
      // // console.log(apiResponse)
      if (apiResponse.status == 200) {
        let modifiedByUserId = apiResponse.data.subItemModifierId;
        let modifiedByUserName = apiResponse.data.subItemModifierName;
        if (this.userId == modifiedByUserId) {
          $('#exampleModalCenter').modal('hide');
        }
        if (this.isFriend(modifiedByUserId) || modifiedByUserId == this.userId) {
          this.toastrService.show(`${modifiedByUserName} updated the subitem ${apiResponse.data.subItemName}`)
        }
        this.modifySubItem(apiResponse.data, 'modify');
      }
      else if (this.userId == apiResponse.data.subItemModifierId) {
        if (apiResponse.status == 404) {
          this.toastrService.error("Error while updating subitem.")
          this.router.navigate(['/notfound']);
        }
        else if (apiResponse.status == 500) {
          this.toastrService.error("Error while updating subitem.")
          this.router.navigate(['/servererror']);
        }
      }
    })
  }

  // function to update UI based on subitem
  addNewSubItem = (data) => {
    for (let item of this.allItems) {
      if (item['itemId'] == data.parentItemId) {
        delete data.itemId;
        item['subItems'].push(data);
      }
    }
  }

  // function to update UI based on item
  addNewItem = (data) => {
    for (let list of this.allLists) {
      if (list['listId'] == data.listId) {
        this.allItems.push(data)
      }
    }
  }

  // function to get currently selected list/item/subitem
  currentlySelected = (list, item = 0, subitem = 0) => {
    if (item == 0 && subitem == 0) {
      this.isList = true;
      this.selectedList = list;
      this.selectedItem = 0;
      this.selectedSubItem = 0;
      this.toBeEditedText = list.listName;
    }
    else if (subitem == 0) {
      this.isList = false
      this.selectedList = list;
      this.selectedItem = item;
      this.selectedSubItem = 0;
      this.toBeEditedText = item['itemName'];
    }
    else {
      this.isList = false
      this.selectedItem = item;
      this.selectedSubItem = subitem;
      this.selectedList = list;
      this.toBeEditedText = subitem['subItemName']
    }
  }

  // function to emit update list/item/subitem
  update = () => {
    if (this.disconnectedSocket == true) {
      this.toastrService.error("Network problem.")
    }
    else if (!this.toBeEditedText || this.toBeEditedText.length == 0) {
      this.toastrService.warning("Enter some text.")
    }
    else if (this.selectedItem == 0 && this.selectedSubItem == 0) {
      let data = {
        listName: this.toBeEditedText,
        listId: this.selectedList.listId,
        listModifierName: this.userName,
        listModifierId: this.userId
      }
      this.todoService.emitEvent('update-list', data)
    }
    else if (this.selectedSubItem == 0) {
      let data = {
        itemName: this.toBeEditedText,
        listId: this.selectedList.listId,
        itemId: this.selectedItem.itemId,
        itemModifierName: this.userName,
        itemModifierId: this.userId,
        itemDone: this.mark
      }
      this.todoService.emitEvent('update-item', data)
    }
    else {
      let data = {
        subItemName: this.toBeEditedText,
        listId: this.selectedList.listId,
        itemId: this.selectedItem.itemId,
        subItemId: this.selectedSubItem.subItemId,
        subItemModifierName: this.userName,
        subItemModifierId: this.userId,
        subItemDone: this.mark
      }
      this.todoService.emitEvent('update-subitem', data)
    }

  }

  // function to emit create item/subitem
  additem_subitem = () => {
    if (this.disconnectedSocket == true) {
      this.toastrService.error("Network problem.")
    }
    else if (!this.item_subitem || this.item_subitem.length == 0) {
      this.toastrService.warning("Enter some text.")
    }
    else if (this.selectedSubItem == 0 && this.selectedItem == 0) {
      // console.log("item")
      let data = {
        listId: this.selectedList.listId,
        itemName: this.item_subitem,
        itemCreatorId: this.userId,
        itemCreatorName: this.userName,
        itemBelongsTo: this.selectedFriend ? this.selectedFriend.friendId : this.userId
      }
      this.todoService.emitEvent('create-item', data);
    }
    else {
      // console.log("subitem")
      let data = {
        itemId: this.selectedItem.itemId,
        subItemName: this.item_subitem,
        subItemCreatorId: this.userId,
        subItemCreatorName: this.userName,
        subItemBelongsTo: this.selectedFriend ? this.selectedFriend.friendId : this.userId
      }
      this.todoService.emitEvent('create-subitem', data);
    }
  }

  // function to emit delete subitem
  deleteSubItem = (list, item, subItem) => {
    if (this.disconnectedSocket == true) {
      this.toastrService.error("Network problem.")
    }
    else {
      let data = {
        listId: list.listId,
        itemId: item.itemId,
        subItemId: subItem.subItemId,
        subItem: subItem,
        type: 'subItem',
        deletedBy: this.userName
      }
      this.todoService.emitEvent('delete-subitem', data);
    }
  }

  // function to emit create list
  createList = () => {
    if (this.disconnectedSocket == true) {
      this.toastrService.error("Network problem.")
    }
    else if (!this.listName || this.listName.length == 0) {
      this.toastrService.warning("Enter list name")
    }
    else {
      let data = {
        listName: this.listName,
        listCreatorId: this.userId,
        listCreatorName: this.userName,
        listBelongsTo: this.userId
      }
      this.todoService.emitEvent('create-list', data);
    }
  }

  // function to get newly created list
  getNewList = () => {
    this.getNewListSubs = this.todoService.getNewList().subscribe((apiResponse) => {
      if (apiResponse.status == 200) {
        if (this.userId == apiResponse.data.listCreatorId) {
          $('#listModal').modal('hide');
        }
        if (apiResponse.data.undo == true && (apiResponse.data.changeDoneById == this.userId || this.isFriend(apiResponse.data.changeDoneById))) {
          // console.log("undo")
          this.toastrService.show(`${apiResponse.data.changeDoneById == this.userId ? 'You' : apiResponse.data.changeDoneByName} made an undo change.`)
          this.allLists.push(apiResponse.data)
        }
        else if (this.selectedFriend != null && this.selectedFriend.friendId == apiResponse.data.listCreatorId) {
          this.allLists.push(apiResponse.data)
          this.listName = ""
          this.toastrService.show(`${apiResponse.data.listCreatorName} created a  new Todo-list ${apiResponse.data.listName}`);
        }
      }
      else if (this.userId == apiResponse.data.listCreatorId) {
        if (apiResponse.status == 404) {
          this.toastrService.error("Error while creating list")
          this.router.navigate(['/notfound']);
        }
        else if (apiResponse.status == 500) {
          this.toastrService.error("Error while creating list.")
          this.router.navigate(['/servererror']);
        }
      }
    })
  }

  // function to delete list
  deleteList = (list) => {
    if (this.disconnectedSocket == true) {
      this.toastrService.error("Network problem.")
    }
    else {
      let data = {
        listId: list.listId,
        deletedBy: this.userName,
        list: list,
        type: 'list'
      }
      this.todoService.emitEvent('delete-list', data);
    }
  }

  // function to delete item
  deleteItem = (list, Item) => {
    if (this.disconnectedSocket == true) {
      this.toastrService.error("Network problem.")
    }
    else {
      let data = {
        listId: list.listId,
        itemId: Item.itemId,
        item: Item,
        type: 'item',
        deletedBy: this.userName
      }
      this.todoService.emitEvent('delete-item', data);
    }
  }

  // function to perform undo action
  undo = () => {
    if (this.disconnectedSocket == true) {
      this.toastrService.error("Network problem.")
    }
    else if (this.selectedFriend == null) {
      let data = {
        userId: this.userId,
        userName: this.userName
      }
      this.todoService.emitEvent('undo', data)
    }
    else {
      let data = {
        userId: this.selectedFriend.friendId,
        userName: this.userName
      }
      this.todoService.emitEvent('undo', data)
    }
  }

  // function to get undo_error after undo action
  getUndoError = () => {
    this.undoSubs = this.getNewItemSubs = this.todoService.getUndoError().subscribe((apiResponse) => {
      // // console.log(apiResponse)
      if (apiResponse.status == 404) {
        let createdByUserId = apiResponse.data.changeDoneById;
        if (createdByUserId == this.userId) {
          this.toastrService.show(apiResponse.message)
        }
      }
    })
  }

  // function to seperate objects based on friend and request status
  public seperateRequestAndFriendsForCurrentUser = (friendList) => {
    //console.log(friendList)
    for (let f of friendList) {
      /* if (this.userId == f.user1Id) {
        // removing users who are in friend status
        for (let u of this.allUsers) {
          if (u.userId == f.user2Id) {
            let removeIndex = this.allUsers.map(function (user) { return user.userId; }).indexOf(u.userId);
            this.allUsers.splice(removeIndex, 1)
          }
        }
      } */
      if (f.status == 'friend') {
        // removing users who are in friend status
        for (let u of this.allUsers) {
          if (u.userId == f.user2Id || u.userId == f.user1Id) {
            let removeIndex = this.allUsers.map(function (user) { return user.userId; }).indexOf(u.userId);
            this.allUsers.splice(removeIndex, 1)
          }
        }
      }
      if (f.status == 'request' && f.user2Id == this.userId) {
        this.friendRequest.push(f)
        for (let u of this.allUsers) {
          if (u.userId == f.user1Id) {
            let removeIndex = this.allUsers.map(function (user) { return user.userId; }).indexOf(u.userId);
            this.allUsers.splice(removeIndex, 1)
          }
        }
      }
      else if (f.status == 'friend') {
        if (f.user1Id == this.userId) {
          this.friendDetails = {
            friendId: f.user2Id,
            friendName: f.user2Name
          }
          this.friends.push(this.friendDetails)
        }
        else if (f.user2Id == this.userId) {
          this.friendDetails = {
            friendId: f.user1Id,
            friendName: f.user1Name
          }
          this.friends.push(this.friendDetails)
        }

      }
      // console.log(this.friends)
    }
  }

  // function to check whether user is logged in or not
  public checkStatus = () => {
    if (this.cookieService.get('authToken') === undefined || this.cookieService.get('authToken') === '' ||
      this.cookieService.get('authToken') === null) {
      this.toastrService.error("Please login first.");
      this.router.navigate(['/']);
      return false;
    } else {
      return true;
    }
  }

  // function to  verify user confirmation
  public verifyUserConfirmation: any = () => {
    this.conSubs = this.todoService.verifyUser()
      .subscribe((data) => {
        this.disconnectedSocket = false;
        this.spinner.hide();
        this.getAllUsers();
        this.selectedFriend ? this.getAllLists(this.selectedFriend.friendId) : this.getAllLists(this.userId);
        this.getAllItems()
        this.toastrService.success("Connection is live.")
        this.todoService.emitEvent('set-user', this.authToken)
      });
  }

  // function to  send request
  public sendRequest = (user) => {
    if (this.disconnectedSocket == true) {
      this.toastrService.error("Network problem.")
    }
    else {
      let data = {
        user1Id: this.userId,
        user1Name: this.userName,
        user2Id: user.userId,
        user2Name: `${user.firstName} ${user.lastName}`
      }
      this.todoService.emitEvent('send-request', data)
    }
  }

  // function to  get new friend request
  public getNewFriendRequest = () => {
    this.getNewFriendRequestSubs = this.todoService.getNewFriendRequest().subscribe((apiResponse) => {
      // // console.log(apiResponse)
      if (apiResponse.status == 200) {
        if (apiResponse.data.user1Id == this.userId) {
          this.toastrService.success('Request send successfully.')
          for (let user of this.allUsers) {
            if (user.userId === apiResponse.data.user2Id) {
              let removeIndex = this.allUsers.map(function (user) { return user.userId; }).indexOf(user.userId);
              this.allUsers.splice(removeIndex, 1)
            }
          }
        }
        else if (apiResponse.data.user2Id == this.userId) {
          this.toastrService.info(`You received a new request from ${apiResponse.data.user1Name}.`)
          this.friendRequest.push(apiResponse.data)
          for (let u of this.allUsers) {
            if (u.userId == apiResponse.data.user1Id) {
              let removeIndex = this.allUsers.map(function (user) { return user.userId; }).indexOf(u.userId);
              this.allUsers.splice(removeIndex, 1)
            }
          }
          // console.log(this.friendRequest)
        }
      }
      else {
        if (apiResponse.data.user1Id == this.userId) {
          this.toastrService.error(apiResponse.message);
        }
      }
    },
      (err) => {
        this.toastrService.error(err.message);
      });
  }

  // function to  get new friend 
  public getNewFriend = () => {
    this.getNewFriendSubs = this.todoService.getNewFriend().subscribe((apiResponse) => {
      // // console.log(apiResponse)
      if (apiResponse.status == 200) {
        if (apiResponse.data.user1Id == this.userId) {
          this.toastrService.success(`You are now friend with ${apiResponse.data.user2Name}`)
          let newFriend = {
            friendId: apiResponse.data.user2Id,
            friendName: apiResponse.data.user2Name,
          }
          this.friends.push(newFriend)
        }
        else if (apiResponse.data.user2Id == this.userId) {
          this.toastrService.info(`You are now friend with ${apiResponse.data.user1Name}`)
          for (let u of this.friendRequest) {
            if (u.user1Id == apiResponse.data.user1Id) {
              let removeIndex = this.friendRequest.map(function (user) { return user.user1Id; }).indexOf(u.user1Id);
              this.friendRequest.splice(removeIndex, 1)
            }
          }
          let newFriend = {
            friendId: apiResponse.data.user1Id,
            friendName: apiResponse.data.user1Name,
          }
          this.friends.push(newFriend)
          // console.log(this.friendRequest)
        }
      }
      else {
        if (apiResponse.data.user1Id == this.userId) {
          this.toastrService.error(apiResponse.message);
        }
      }
    },
      (err) => {
        this.toastrService.error(err.message);
      });
  }

  // function to  accept friend request
  public acceptRequest = (data) => {
    if (this.disconnectedSocket == true) {
      this.toastrService.error("Network problem.")
    }
    else {
      this.todoService.emitEvent('accept-request', data)
    }
  }

  // function to  get friend todos
  public getFriendTodos = (user) => {
    if (this.disconnectedSocket == true) {
      this.toastrService.error("Network problem.")
    }
    else {
      this.selectedFriend = user;
      this.getAllLists(user.friendId);
      this.getAllItems();
    }
  }

  // function to  currentUser todos
  public getMyTodos = () => {
    if (this.disconnectedSocket == true) {
      this.toastrService.error("Network problem.")
    }
    else {
      this.selectedFriend = null
      this.getAllLists(this.userId);
      this.getAllItems();
    }
  }

  // function to logout user
  public logout = () => {
    this.spinner.show();
    this.userManagementService.logout().subscribe((apiResponse) => {
      this.spinner.hide();
      if (apiResponse.status === 200) {
        this.cookieService.delete('authToken');
        this.cookieService.delete('userId');
        this.cookieService.delete('userName');
        this.toastrService.success("Logged out successfully.")
        this.router.navigate(['/']);
      }
      else {
        this.toastrService.error(apiResponse.message);
      }
    },
      (err) => {
        this.spinner.hide();
        this.toastrService.error("Some error occured.");
      })
  }

  // function to check whether connection is established or not
  callDisconnectedSocket = () => {
    this.liveConSubs = this.todoService.disconnectedSocket().subscribe(() => {
      this.disconnectedSocket = true;
      this.spinner.show();
      //this.toastrService.error("Connection-lost", 'Check network-connection');
    })
  }

  // unsubscribing all the subscriptions
  ngOnDestroy() {
    this.conSubs.unsubscribe();
    this.liveConSubs.unsubscribe();
    this.undoSubs.unsubscribe();
    this.deletedListSubs.unsubscribe();
    this.deletedItemSubs.unsubscribe();
    this.deletedSubItemSubs.unsubscribe();
    this.getNewSubItemSubs.unsubscribe();
    this.getNewItemSubs.unsubscribe();
    this.getNewListSubs.unsubscribe();
    this.updatedListSubs.unsubscribe();
    this.updatedItemSubs.unsubscribe();
    this.updatedSubItemSubs.unsubscribe();
    this.getNewFriendRequestSubs.unsubscribe();
    this.getNewFriendSubs.unsubscribe();
  }
}
