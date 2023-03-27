
RPN-RR enables a **calculated field** for computing and storing your INITIAL RISK and RESIDUAL RISK on your work items.

All defects are created equal.
RPN [RPN (Risk Priority Number)] is a calculation of several factors in a defect to help quantify the overall risk of a defect.
[RPN = (Severity * Occurence * Detection)](http://www.fmea-fmeca.com/fmea-rpn.html)

Four values are used to calculate RPN (for our use here):
* **Severity**
* **Occurence**
* **Detection** 
* **Users Affected**

**NOTE:** If you do not want to use one of these fields to use for assessing RPN (For example "Users Affected"), you can workaround this by creating the field, and setting the default value to 1. And do not make the field able to be seen when submitting. Thusly, in the calculation the field will not affect RPN value.

# Setup (Do this for both Initial Risk AND Residual Risk)
1. Create RPN Field:
   1. The first thing you need is to create the fields that will store the RPN value.  [Create a custom decimal field](https://www.visualstudio.com/en-us/docs/work/process/customize-process-field#add-a-custom-field) through the process hub and add it to the work items you want to display RPN data on.
2. Create Input Values for RPN Field:
   1. *NOTE:*  These fields typically are integer or picklist-integer. However, in specific cases you can make these a string/picklist-string.  In the case of using 'picklist-string', the format needs to be `<number>  - description of number`.  
        Example:
        ```
        1 - low probability
        2 - medium probability
        10 - extra high probability
        100 - super mega-high chance of occurence
        ```

3. Navigate to the "RPN" hub on the collection settings admin experience.  From here, you must specify the fields that will be used for Severity, Occurence, Detection, Users Affected, and RPN.

# Features
## Auto calculated RPN field on the form
* RPN is automatically updated when form is loaded.
* RPN is automatically updated when any input field is updated.

## Recalculate RPN context menu item
* Update RPN for all selected work items on the backlog or query grid.

## Settings hub
* Specify which fields are used for Severity, Occurence, Detection, Users Affected, and RPN.

## Support
Because this extension requires the new work item form, it is only supported on Azure DevOps and the next version of TFS 2018 and above.