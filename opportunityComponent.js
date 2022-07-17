import { LightningElement, wire, track, api } from 'lwc';
import getOpportunitiesList from '@salesforce/apex/OpportunityController.getOpportunitiesList';
import Id from '@salesforce/user/Id';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import createNewTask from '@salesforce/apex/OpportunityController.createNewTask';

// datatable columns with row actions. Set sortable = true
const columns = [ { label: 'AccountId', fieldName: 'AccountId', sortable: "true"},
                  { label: 'Name', fieldName: 'Name', sortable: "true"},
                  { label: 'ExpectedRevenue', fieldName: 'ExpectedRevenue', sortable: "true"},
                  { label: 'DaysSinceCreated__c', fieldName: 'DaysSinceCreated__c', sortable: "true" }
                ];

export default class OpportunityComponent extends LightningElement {

    @api recordId;

    userId = Id;
    @track data;
    @track columns = columns;
    @track sortBy;
    @track sortDirection;
    @track customFormModal = false; 
    @track subjectValue='';

    @track statusValue='';
    @track statusOptions = [
        {label:'Not Started', value:'Not Started'},
        {label:'In Progress', value:'In Progress'},
        {label:'Completed', value:'Completed'},
        {label:'Waiting on someone else', value:'Waiting on someone else'},
        {label:'Deferred', value:'Deferred'}
    ];

    @track priorityValue='';
    @track priorityOptions = [
        {label:'High', value:'High'},
        {label:'Normal', value:'Normal'},
        {label:'Low', value:'Low'}
    ];
    
    // apex class call
    @wire(getOpportunitiesList)
    opp(result) {
        if (result.data) {
            this.data = result.data;
            this.error = undefined;
        } else if (result.error) {
            this.error = result.error;
            this.data = undefined;
        }
    }

    // sorting func
    doSorting(event) {
        this.sortBy = event.detail.fieldName;
        this.sortDirection = event.detail.sortDirection;
        this.sortData(this.sortBy, this.sortDirection);
    }

    sortData(fieldname, direction) {
        let parseData = JSON.parse(JSON.stringify(this.data));

        // Return the value stored in the field
        let keyValue = (a) => {
            return a[fieldname];
        };

        // cheking reverse direction
        let isReverse = direction === 'asc' ? 1: -1;

        // sorting data
        parseData.sort((x, y) => {
            x = keyValue(x) ? keyValue(x) : ''; // handling null values
            y = keyValue(y) ? keyValue(y) : '';

            // sorting values based on direction
            return isReverse * ((x > y) - (y > x));
        });
        this.data = parseData;
    }    
    
    customShowModalPopup() {            
        this.customFormModal = true;
    }
 
    customHideModalPopup() {    
        this.customFormModal = false;
    }

    statusHandleChange(event) {
        this.statusValue = event.target.value;
    }

    priorityHandleChange(event) {
        this.priorityValue = event.target.value;
    }

    subjectHandleChange(event) {
        this.subjectValue = event.target.value;
    }

    showsuccess() {
        const event = new ShowToastEvent({
            title: 'Success!',
            message: 'Task created!',
            variant: 'success'
        });
        this.dispatchEvent(event);
        this.customFormModal = false;
    }
    

    showerror(mssg) {
        const evt = new ShowToastEvent({
            title: 'Toast Error',
            message: mssg,
            variant: 'error',
            mode: 'dismissable'
        });
        this.dispatchEvent(evt);
    }

    createRecord() {
        createNewTask({subject:this.subjectValue, status: this.statusValue, priority: this.priorityValue, OwnerId:this.userId, RelatedTo: this.recordId})
        .then((result) => this.showsuccess())
        .catch((error) => this.showerror(error.message))
    }
} 