//====================================================
// GOOGLE APPS SCRIPT WEB APP URL
// (Paste your deployed Web App URL here in Part 3C)
//====================================================

const API_URL = "https://script.google.com/macros/s/AKfycbzBqK-ak_jN-6tqJ5L1BDlJEBpDgSOnbG5DOa-EwMNDLz8rxCMYywb3pkTO9eN8XlAy/exec";

//====================================================
// MODEL DATA
//====================================================

const models = {

    "KAM-G": [
        "15MM",
        "20MM",
        "25MM",
        "40MM",
        "50MM"
    ],

    "KBM-G": [
        "15MM",
        "20MM",
        "25MM",
        "40MM",
        "50MM",
        "15MM-SJ",
        "15MM KBM",
        "15MM Ultra-G",
        "15MM Rite"
    ],

    "Bulk": [
        "40MM",
        "50MM",
        "65MM",
        "80MM",
        "100MM",
        "150MM",
        "200MM",
        "250MM",
        "300MM"
    ],

    "Bulk Hot": [
        "40MM",
        "50MM",
        "65MM",
        "80MM",
        "100MM",
        "150MM",
        "200MM"
    ]

};

//====================================================
// CREATE COMPLETE ORDER FORM
//====================================================

window.onload = function () {

    createOrderForm();

};

//====================================================
// CREATE MODEL SECTIONS
//====================================================

function createOrderForm() {

    const container = document.getElementById("itemsContainer");

    container.innerHTML = "";

    for (const model in models) {

        // Create Model Card

        const section = document.createElement("div");

        section.className = "model";

        // Model Title

        const title = document.createElement("div");

        title.className = "model-title";

        title.innerText = model;

        section.appendChild(title);

        // Sizes

        models[model].forEach(function(size){

            const row = createItemRow(model,size);

            section.appendChild(row);

        });

        container.appendChild(section);

    }

}

//====================================================
// CREATE EACH SIZE ROW
//====================================================

function createItemRow(model,size){

    const row = document.createElement("div");

    row.className = "item";

    // Create Unique ID

    const id = (model + "_" + size)
        .replace(/\s/g,"")
        .replace(/-/g,"");

    // Checkbox

    const checkbox = document.createElement("input");

    checkbox.type = "checkbox";

    checkbox.id = "chk_" + id;

    // Size Label

    const label = document.createElement("label");

    label.innerText = size;

    // Quantity Textbox

    const qty = document.createElement("input");

    qty.type = "text";

    qty.placeholder = "Example : 4 Carton / 2 Piece";

    qty.className = "qty";

    qty.id = id;

    qty.disabled = true;

    qty.setAttribute("data-model",model);

    qty.setAttribute("data-size",size);

    // Enable Disable Quantity

    checkbox.addEventListener("change",function(){

        qty.disabled = !checkbox.checked;

        if(!checkbox.checked){

            qty.value="";

        }else{

            qty.focus();

        }

    });

    row.appendChild(checkbox);

    row.appendChild(label);

    row.appendChild(qty);

    return row;

}


//====================================================
// BUILD SELECTED ITEMS
//====================================================

function buildItems() {

    const selectedItems = [];

    const qtyBoxes = document.querySelectorAll(".qty");

    qtyBoxes.forEach(function (box) {

        if (!box.disabled) {

            const quantity = box.value.trim();

            if (quantity !== "") {

                const model = box.dataset.model;

                const size = box.dataset.size;

                selectedItems.push(
                    `${model} ${size} (${quantity})`
                );

            }

        }

    });

    return selectedItems;

}

//====================================================
// SHOW ERROR MESSAGE
//====================================================

function showError(message){

    const errorBox=document.getElementById("errorMessage");

    errorBox.style.display="block";

    errorBox.innerHTML=message;

    document.getElementById("successMessage").style.display="none";

    errorBox.scrollIntoView({

        behavior:"smooth",

        block:"center"

    });

}

//====================================================
// SHOW SUCCESS MESSAGE
//====================================================

function showSuccess(message){

    const successBox=document.getElementById("successMessage");

    successBox.style.display="block";

    successBox.innerHTML=message;

    document.getElementById("errorMessage").style.display="none";

}

//====================================================
// HIDE ALL MESSAGES
//====================================================

function hideMessages(){

    document.getElementById("errorMessage").style.display="none";

    document.getElementById("successMessage").style.display="none";

}

//====================================================
// VALIDATE COMPLETE FORM
//====================================================

function validateForm(){

    hideMessages();

    const partyName=document
        .getElementById("partyName")
        .value
        .trim();

    if(partyName===""){

        showError("Please enter Party Name.");

        return false;

    }

    const items=buildItems();

    if(items.length===0){

        showError(
            "Please select at least one item and enter its quantity."
        );

        return false;

    }

    return true;

}

//====================================================
// GET COMPLETE ORDER OBJECT
//====================================================

function getOrderData(){

    return{

        partyName:document
            .getElementById("partyName")
            .value
            .trim(),

        items:buildItems().join(", ")

    };

}

//====================================================
// LOADING BUTTON
//====================================================

function setLoading(isLoading){

    const btn=document.getElementById("submitBtn");

    if(isLoading){

        btn.disabled=true;

        btn.innerHTML="Placing Order...";

    }else{

        btn.disabled=false;

        btn.innerHTML="Place Order";

    }

}





//====================================================
// PLACE ORDER
//====================================================

//====================================================
// PLACE ORDER
//====================================================
//====================================================
// PLACE ORDER (Bulletproof CORS Bypass version)
//====================================================
async function placeOrder() {
    // Validate Form
    if (!validateForm()) {
        return;
    }

    // Show Loading
    setLoading(true);
    hideMessages();

    try {
        const orderData = getOrderData();

        // Convert the JSON data into URL-encoded form parameters
        // This completely eliminates the CORS preflight check across all browsers
        const formBody = new URLSearchParams();
        formBody.append("formData", JSON.stringify(orderData));

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
            },
            body: formBody
        });

        const result = await response.json();
        setLoading(false);

        if (result.success) {
            document.querySelector(".card").style.display = "none";
            document.getElementById("thankYouPage").style.display = "block";
            document.getElementById("thankYouText").innerHTML =
                "Your order has been placed successfully.<br><br>" +
                "Please note your Order ID for future reference.<br><br>" +
                "<strong>" + result.orderId + "</strong>";

            resetForm();
        } else {
            showError("Facing some issue in placing order.<br>Details: " + (result.message || "Unknown error"));
        }
    }
    catch (error) {
        setLoading(false);
        showError("Facing some issue in placing order.<br>Please try after some time!");
        console.error(error);
    }
}

//====================================================
// RESET FORM
//====================================================

function resetForm() {

    document.getElementById("partyName").value = "";

    document
        .querySelectorAll("input[type='checkbox']")
        .forEach(function (chk) {

            chk.checked = false;

        });

    document
        .querySelectorAll(".qty")
        .forEach(function (box) {

            box.value = "";

            box.disabled = true;

        });

}

//====================================================
// PLACE NEW ORDER
//====================================================

function newOrder() {

    document.getElementById("thankYouPage").style.display = "none";

    document.querySelector(".card").style.display = "block";

    hideMessages();

}
