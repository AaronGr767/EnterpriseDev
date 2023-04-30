let inputType;
let Active = false;
let selectedProduct;
let search = false;
let productsDisplayed = false;

let first,last;
let monitorId = [];


//Dispays all selected colours
function displayProducts() {

    let filters = document.getElementById("filterCont")
    filters.style.visibility = "visible"

    monitorId = []

    productsDisplayed = true;

    //Call to endpoint to retrieve all colours
    let time1 = performance.now()
    fetch('/products')
        .then(response => response.json())
        .then(data => {

            let time2 = performance.now()
            let finalTime = time2 - time1

            console.log("Loading this data took " + finalTime + "ms")
            // window.history.replaceState(null, "Colours", "/home/colours")

            let productsData = data;
            console.log(productsData)

            let table = document.getElementById("contentTable")

            table.innerHTML = `<thead>
                                    <th scope="col">ID</th>
                                    <th scope="col">Name</th>
                                    <th scope="col">Brand</th>
                                    <th scope="col">Category</th>
                                    <th scope="col">Price</th>
                                </thead>`;

            //Populate table with product data                        
            for (i = 0; i < productsData.length; i++) {
                monitorId.push(productsData[i].id)

                table.innerHTML += `<tr onclick=selectProduct(${productsData[i].id}) data-bs-toggle="modal" data-bs-target="#selectModal">
                                        <td>${productsData[i].id}</td>
                                        <td>${productsData[i].title}</td>
                                        <td>${productsData[i].brand}</td>
                                        <td>${productsData[i].category}</td>
                                        <td>${productsData[i].price}</td>
                                    </tr>`
            }

            first = 0
            last = productsData.length
        })
        .catch(error => console.error(error));

}

//Retrieve selected colour
function selectProduct(prodId) {

    let nav1 = document.getElementById("navButBack")
    let nav2 = document.getElementById("navButFor")

    let idSpan = document.getElementById("guide")
    idSpan.innerHTML = `<strong>${prodId}</strong>`

    if(prodId == monitorId[first]){
        nav1.style.visibility ="hidden";
    }else if(prodId == monitorId[last]){
        nav2.style.visibility = "hidden"
    }else{
        nav1.style.visibility = "visible"
        nav2.style.visibility = "visible"
    }

    //Fetch request based on supplied colour ID
    fetch(`/products/${prodId}`, { method: 'GET' })
        .then(response => response.json())
        .then(data => {
            console.log(data)
            populateProduct(data)
            // window.history.replaceState(null, "Colours", `/home/colours/${data.colorId}`)

            //Displays the modal if the user searched by ID
            if (search == true) {
                search = false

                let modalDisp = document.getElementById("showMod")
                modalDisp.click();
            }

            selectedProduct = data;
        })
        .catch(error => { console.log(error) })
}

//Populates the modal with the selected colour's data
function populateProduct(productData) {
    let prodId = document.getElementById("prodId")
    prodId.innerHTML = `${productData.id}`


    let selName = document.getElementById("selectedName")
    selName.value = `${productData.title}`
    let selPrice = document.getElementById("selectedPrice")
    selPrice.value = `${productData.price}`

    let selBrand = document.getElementById("selectedBrand")
    selBrand.value = `${productData.brand}`
    let selCat = document.getElementById("selectedCat")
    selCat.value = `${productData.category}`


    let img1 = document.getElementById("image1")
    img1.innerHTML = `<img src=${productData.thumbnail} class="d-block w-100">`

    let img2 = document.getElementById("image2")
    img2.innerHTML = `<img src=${productData.images[0]} class="d-block w-100">`
    let img3 = document.getElementById("image3")
    img3.innerHTML = `<img src=${productData.images[1]} class="d-block w-100">`



}



//Delete the selected colour
function deleteProduct() {
    let selId = document.getElementById("prodId")
    let delId = selId.innerHTML

    console.log(delId)

    //Delete request for the selected colour
    fetch(`/products/${delId}`, { method: 'DELETE' })
        .then(response => response)
        .then(data => {
            console.log(data)
            // window.history.replaceState(null, "Colours", "/home/colours")
            displayProducts()
        })
        .catch(error => { console.log(error) })
}

function hideAlert() {
    let alert1 = document.getElementById("warnAlert1")
    alert1.style.display = 'none';

    let alert2 = document.getElementById("warnAlert2")
    alert2.style.display = 'none';

    let alert3 = document.getElementById("warnAlert3")
    alert3.style.display = 'none';
}

//Saves the user's created colour
function saveColour() {
    let name = document.getElementById("newName").value
    let price = document.getElementById("newPrice").value
    let brand = document.getElementById("newBrand").value
    let category = document.getElementById("newCat").value
    let img1 = document.getElementById("newImg1").value
    let img2 = document.getElementById("newImg2").value
    let img3 = document.getElementById("newImg3").value

    let alert = document.getElementById("warnAlert1")
    let imgAlert = document.getElementById("warnAlert3")
    let saveBut = document.getElementById("saveButton")

    let verify = /[\/.](gif|jpg|jpeg|tiff|png)$/i

    //Checks that the user has given the colour name
    if (name.length == 0 || price.length == 0 || brand.length == 0 || category.length == 0) {
        alert.style.display = 'block';

        //Checks that the entered colour is valid

    } else if (!verify.test(img1) || !verify.test(img2) || !verify.test(img3)){
        imgAlert.style.display = 'block';

    } else {
        saveBut.setAttribute("data-bs-dismiss", "modal");
        saveBut.click()

        if (saveBut.hasAttribute("data-bs-dismiss")) {
            saveBut.removeAttribute("data-bs-dismiss");

            let prodValues = {
                id: 101,
                title: name,
                price: price,
                brand: brand,
                category: category,
                thumbnail: img1,
                images: [img2,img3]
            }

            formatRequest(prodValues)
        }

        if (productsDisplayed == true) {
            displayProducts()
        }
    }
}

//Formats data for use in the colours object
function formatRequest(newProduct) {

    document.body.classList.remove('modal-open');

    console.log(newProduct)

    let postRequest = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
    };

    //Send the POST request containing the new colour's data
    fetch('/products', postRequest)
        .then(response => response.json())
        .then(data => console.log(data))
}

//Update the user's selected colour with any changes 
function updateProduct() {

    let nameVal = document.getElementById("selectedName").value
    let priceVal = document.getElementById("selectedPrice").value

    let brandVal = document.getElementById("selectedBrand").value
    let catVal = document.getElementById("selectedCat").value

    let alert = document.getElementById("warnAlert2")
    let updateBut = document.getElementById("updateButton")

    if (nameVal.length == 0 || priceVal.length == 0 || brandVal.length == 0 || catVal.length == 0) {

        alert.style.display = 'block';
    } else {

        updateBut.setAttribute("data-bs-dismiss", "modal");
        updateBut.click()

        if (updateBut.hasAttribute("data-bs-dismiss")) {
            updateBut.removeAttribute("data-bs-dismiss");
            // formatRequest(colName.value)
        }

        updatedProduct = {
            name: nameVal,
            price: priceVal,
            brand: brandVal,
            category: catVal
        }


        let putRequest = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedProduct)
        };

        //PUT request to update the colour based on colour ID
        fetch(`/products/${selectedProduct.id}`, putRequest)
            .then(response => response)
            .then(data => {
                console.log(data)
                // window.history.replaceState(null, "Colours", "/home/colours")
                displayProducts()
            })

    }

}

//Searches for the users inputted value
function searchProduct() {
    let searchId = document.getElementById("searchForm").value

    let sid = parseInt(searchId)
    search = true

    console.log(sid)

    selectProduct(sid)
}

function nextProduct(){
    let currIndex = monitorId.indexOf(selectedProduct.id)

    let nextId = monitorId[currIndex+1]

    selectProduct(nextId)
}

function lastProduct(){
    let currIndex = monitorId.indexOf(selectedProduct.id)

    let lastId = monitorId[currIndex-1]

    selectProduct(lastId)
}