import Q = require("q");

import TFS_Wit_Contracts = require("TFS/WorkItemTracking/Contracts");
import TFS_Wit_Client = require("TFS/WorkItemTracking/RestClient");
import TFS_Wit_Services = require("TFS/WorkItemTracking/Services");

import { StoredFieldReferences } from "./rpnModels";
 
function GetStoredFields(): IPromise<any> {
    var deferred = Q.defer();
    VSS.getService<IExtensionDataService>(VSS.ServiceIds.ExtensionData).then((dataService: IExtensionDataService) => {
        dataService.getValue<StoredFieldReferences>("storedFields").then((storedFields:StoredFieldReferences) => {
            if (storedFields) {
                console.log("Retrieved fields from storage");
                deferred.resolve(storedFields);
            }
            else {
                deferred.reject("Failed to retrieve fields from storage");
            }
        });
    });
    return deferred.promise;
}

function getWorkItemFormService()
{
    return TFS_Wit_Services.WorkItemFormService.getService();
}

function updateRPNOnForm(storedFields:StoredFieldReferences) {
    getWorkItemFormService().then((service) => {
        service.getFields().then((fields: TFS_Wit_Contracts.WorkItemField[]) => {
            var matchingSeverityValueFields = fields.filter(field => field.referenceName === storedFields.svField);
            var matchingOccurenceFields = fields.filter(field => field.referenceName === storedFields.ocField);
            var matchingDetectionFields = fields.filter(field => field.referenceName === storedFields.dtField);
            var matchingUsersAffectedFields = fields.filter(field => field.referenceName === storedFields.usersField); 
            var matchingRPNFields = fields.filter(field => field.referenceName === storedFields.rpnField);

            //If this work item type has RPN, then update RPN
            if ((matchingSeverityValueFields.length > 0) &&
                (matchingOccurenceFields.length > 0) &&
                (matchingDetectionFields.length > 0) &&
                (matchingUsersAffectedFields.length > 0) &&
                (matchingRPNFields.length > 0)) {
                service.getFieldValues([storedFields.svField, storedFields.ocField, storedFields.dtField, storedFields.usersField]).then((values) => {
                    
                    var severityValue  = +values[storedFields.svField].toString().split('-')[0].trim();
                    console.log("severityValue before is  %s", severityValue);
                    //var severityNum = +severityValue.toString().split('-')[0].trim();
                    //console.log("severityNum after is  %s", severityNum);
                    var Occurence = +values[storedFields.ocField].toString().split('-')[0].trim();
                    var Detection = +values[storedFields.dtField].toString().split('-')[0].trim();
                    var UsersAffected = +values[storedFields.usersField].toString().split('-')[0].trim();

                    var rpn = 0;
                    if (UsersAffected > 0) {
                        rpn = (severityValue * Occurence * Detection *UsersAffected);
                    }
                    
                    service.setFieldValue(storedFields.rpnField, rpn);
                });
            }

            
            var matchingRRSeverityValueFields = fields.filter(field => field.referenceName === storedFields.rr_svField);
            var matchingRROccurenceFields = fields.filter(field => field.referenceName === storedFields.rr_ocField);
            var matchingRRDetectionFields = fields.filter(field => field.referenceName === storedFields.rr_dtField);
            var matchingRRUsersAffectedFields = fields.filter(field => field.referenceName === storedFields.rr_usersField); 
            var matchingRRRPNFields = fields.filter(field => field.referenceName === storedFields.rr_rpnField);

            //If this work item type has RPN, then update RPN
            if ((matchingRRSeverityValueFields.length > 0) &&
                (matchingRROccurenceFields.length > 0) &&
                (matchingRRDetectionFields.length > 0) &&
                (matchingRRUsersAffectedFields.length > 0) &&
                (matchingRRRPNFields.length > 0)) {
                service.getFieldValues([storedFields.rr_svField, storedFields.rr_ocField, storedFields.rr_dtField, storedFields.rr_usersField]).then((values) => {
                    
                    var severityValue  = +values[storedFields.rr_svField].toString().split('-')[0].trim();
                    console.log("severityValue before is  %s", severityValue);
                    //var severityNum = +severityValue.toString().split('-')[0].trim();
                    //console.log("severityNum after is  %s", severityNum);
                    var Occurence = +values[storedFields.rr_ocField].toString().split('-')[0].trim();
                    var Detection = +values[storedFields.rr_dtField].toString().split('-')[0].trim();
                    var UsersAffected = +values[storedFields.rr_usersField].toString().split('-')[0].trim();

                    var rpn = 0;
                    if (UsersAffected > 0) {
                        rpn = (severityValue * Occurence * Detection *UsersAffected);
                    }
                    
                    service.setFieldValue(storedFields.rr_rpnField, rpn);
                });
            }
        });
    });
}

function updateRPNOnGrid(workItemId, storedFields:StoredFieldReferences):IPromise<any> {
    let rpnFields = [
        storedFields.svField,
        storedFields.ocField,
        storedFields.dtField,
        storedFields.usersField,
        storedFields.rpnField,
        storedFields.rr_svField,
        storedFields.rr_ocField,
        storedFields.rr_dtField,
        storedFields.rr_usersField,
        storedFields.rr_rpnField
    ];

    var deferred = Q.defer();

    var client = TFS_Wit_Client.getClient();
    client.getWorkItem(workItemId, rpnFields).then((workItem: TFS_Wit_Contracts.WorkItem) => {
        if (storedFields.rpnField !== undefined && storedFields.dtField !== undefined) {     
            var severityValue = +workItem.fields[storedFields.svField].toString().split('-')[0].trim();
            var Occurence = +workItem.fields[storedFields.ocField].toString().split('-')[0].trim();
            var Detection = +workItem.fields [storedFields.dtField].toString().split('-')[0].trim();
            var UsersAffected = +workItem.fields[storedFields.usersField].toString().split('-')[0].trim();
            // severityValue = severityValue.split('-')[0].trim();

            var rpn = 0;
            if (UsersAffected > 0) {
                rpn = (severityValue * Occurence * Detection * UsersAffected);
            }

            var document = [{
                from: null,
                op: "add",
                path: '/fields/' + storedFields.rpnField,
                value: rpn
            }];

            // Only update the work item if the RPN has changed
            if (rpn != workItem.fields[storedFields.rpnField]) {
                client.updateWorkItem(document, workItemId).then((updatedWorkItem:TFS_Wit_Contracts.WorkItem) => {
                    deferred.resolve(updatedWorkItem);
                });
            }
        }
        
        if (storedFields.rr_rpnField !== undefined && storedFields.rr_dtField !== undefined) {     
            var severityValue = +workItem.fields[storedFields.rr_svField].toString().split('-')[0].trim();
            var Occurence = +workItem.fields[storedFields.rr_ocField].toString().split('-')[0].trim();
            var Detection = +workItem.fields [storedFields.rr_dtField].toString().split('-')[0].trim();
            var UsersAffected = +workItem.fields[storedFields.rr_usersField].toString().split('-')[0].trim();
            // severityValue = severityValue.split('-')[0].trim();

            var rpn = 0;
            if (UsersAffected > 0) {
                rpn = (severityValue * Occurence * Detection * UsersAffected);
            }

            var document = [{
                from: null,
                op: "add",
                path: '/fields/' + storedFields.rr_rpnField,
                value: rpn
            }];

            // Only update the work item if the RPN has changed
            if (rpn != workItem.fields[storedFields.rpnField]) {
                client.updateWorkItem(document, workItemId).then((updatedWorkItem:TFS_Wit_Contracts.WorkItem) => {
                    deferred.resolve(updatedWorkItem);
                });
            }
        }
    });

    return deferred.promise;
}

var formObserver = (context) => {
    return {
        onFieldChanged: function(args) {
            GetStoredFields().then((storedFields:StoredFieldReferences) => {
                if (storedFields && storedFields.svField && storedFields.usersField && storedFields.ocField && storedFields.dtField && storedFields.rpnField) {
                    //If one of fields in the calculation changes
                    if ((args.changedFields[storedFields.svField] !== undefined) || 
                        (args.changedFields[storedFields.ocField] !== undefined) ||
                        (args.changedFields[storedFields.dtField] !== undefined) ||
                        (args.changedFields[storedFields.usersField] !== undefined)) {
                            updateRPNOnForm(storedFields);
                        }
                }
                else {
                    console.log("Unable to calculate RPN, please configure fields on the collection settings page.");    
                }
                
                if (storedFields && storedFields.rr_svField && storedFields.rr_usersField && storedFields.rr_ocField && storedFields.rr_dtField && storedFields.rr_rpnField) {
                    //If one of fields in the calculation changes
                    if ((args.changedFields[storedFields.rr_svField] !== undefined) || 
                        (args.changedFields[storedFields.rr_ocField] !== undefined) ||
                        (args.changedFields[storedFields.rr_dtField] !== undefined) ||
                        (args.changedFields[storedFields.rr_usersField] !== undefined)) {
                            updateRPNOnForm(storedFields);
                        }
                }
                else {
                    console.log("Unable to calculate RR RPN, please configure fields on the collection settings page.");    
                }

            }, (reason) => {
                console.log(reason);
            });
        },
        
        onLoaded: function(args) {
            GetStoredFields().then((storedFields:StoredFieldReferences) => {
                if (storedFields && storedFields.svField && storedFields.usersField && storedFields.ocField && storedFields.dtField && storedFields.rpnField) {
                    updateRPNOnForm(storedFields);
                }
                else {
                    console.log("Unable to calculate RPN, please configure fields on the collection settings page.");
                }
                if (storedFields && storedFields.rr_svField && storedFields.rr_usersField && storedFields.rr_ocField && storedFields.rr_dtField && storedFields.rr_rpnField) {
                    updateRPNOnForm(storedFields);
                }
                else {
                    console.log("Unable to calculate RR RPN, please configure fields on the collection settings page.");
                }
            }, (reason) => {
                console.log(reason);
            });
        }
    } 
}

var contextProvider = (context) => {
    return {
        execute: function(args) {
            GetStoredFields().then((storedFields:StoredFieldReferences) => {
                if (storedFields && storedFields.svField && storedFields.usersField && storedFields.ocField && storedFields.dtField && storedFields.rpnField
                    && storedFields.rr_svField && storedFields.rr_usersField && storedFields.rr_ocField && storedFields.rr_dtField && storedFields.rr_rpnField) {
                    var workItemIds = args.workItemIds;
                    var promises = [];
                    $.each(workItemIds, function(index, workItemId) {
                        promises.push(updateRPNOnGrid(workItemId, storedFields));
                    });

                    // Refresh view
                    Q.all(promises).then(() => {
                        VSS.getService(VSS.ServiceIds.Navigation).then((navigationService: IHostNavigationService) => {
                            navigationService.reload();
                        });
                    });
                }
                else {
                    console.log("Unable to calculate RPN, please configure fields on the collection settings page.");
                    //TODO: Disable context menu item
                }
            }, (reason) => {
                console.log(reason);
            });
        }
    };
}

let extensionContext = VSS.getExtensionContext();
VSS.register(`${extensionContext.publisherId}.${extensionContext.extensionId}.rpn-rr-work-item-form-observer`, formObserver);
VSS.register(`${extensionContext.publisherId}.${extensionContext.extensionId}.rpn-rr-contextMenu`, contextProvider);