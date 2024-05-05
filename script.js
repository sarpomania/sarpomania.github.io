const key =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnYWZjdHpvZG9ldnVud216bXd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTMxODA5MDIsImV4cCI6MjAyODc1NjkwMn0.JrzXWG5raNMCAb3wEBv1aCxE0R9P5-TWLQy-uITewDU";
const url = "https://bgafctzodoevunwmzmwx.supabase.co";
const database = supabase.createClient(url, key);

function searchPeople(query) {
  if (!database || query.trim() === "") {
    console.error("Supabase is not initialized or query is empty");
    return;
  }

  database
    .from("People")
    .select("*")
    .ilike("Name", `%${query}%`)
    .then((response) => {
      if (response.data.length === 0) {
        database
          .from("People")
          .select("*")
          .ilike("LicenseNumber", `%${query}%`)
          .then((response) => {
            if (response.data.length === 0) {
              displayNoResultsMessageForPeople();
            } else {
              displaySearchResultsForPeople(response.data);
            }
          })
          .catch((error) => {
            console.error("Error searching people:", error);
          });
      } else {
        displaySearchResultsForPeople(response.data);
      }
    })
    .catch((error) => {
      console.error("Error searching people:", error);
    });
}

function handleKeyPressForPeople(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    searchPeople(document.getElementById("search").value);
  }
}

function displayNoResultsMessageForPeople() {
  const searchResultsDiv = document.getElementById("searchResults");
  searchResultsDiv.innerHTML =
    "<p>No people found with the provided information.</p>";
}

function displaySearchResultsForPeople(results) {
  const searchResultsDiv = document.getElementById("searchResults");
  searchResultsDiv.innerHTML = "";

  results.forEach((result, index) => {
    const button = document.createElement("button");
    button.style.height = "auto";
    button.style.fontSize = "15px";
    button.textContent = `${result.PersonID} - ${result.Name}`;
    button.classList.add("result-button");
    button.setAttribute("data-index", index);
    button.setAttribute("data-key", "Name");
    button.setAttribute("data-info", JSON.stringify(result));
    button.addEventListener("click", showAttributesForPeople);
    searchResultsDiv.appendChild(button);
  });
}

var isClicked = false;

function showAttributesForPeople() {
  const resultInfo = JSON.parse(this.getAttribute("data-info"));
  const buttonHeight = this.scrollHeight;

  if (isClicked === false) {
    let attributes = '<div style="text-align: left; padding-top: 10px;">';
    for (const key in resultInfo) {
      if (resultInfo.hasOwnProperty(key)) {
        attributes += `<div>${key}: ${resultInfo[key]}</div>`;
      }
    }
    attributes += "</div>";
    this.innerHTML = attributes;
    isClicked = true;
  } else {
    this.textContent = `${resultInfo.PersonID} - ${resultInfo.Name}`;
    this.style.height = "auto";
    isClicked = false;
  }
}

function searchVehicle(vehicleID) {
  if (!database || vehicleID.trim() === "") {
    console.error("Supabase is not initialized or query is empty");
    return;
  }

  database
    .from("Vehicles")
    .select("*")
    .eq("VehicleID", vehicleID)
    .then((response) => {
      if (response.data.length === 0) {
        displayNoResultsMessage();
      } else {
        displaySearchResultsForVehicle(response.data);
      }
    })
    .catch((error) => {
      console.error("Error searching vehicles:", error);
    });
}

function handleKeyPressForVehicle(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    searchVehicle(document.getElementById("plateNumber").value);
  }
}

function displayNoResultsMessage() {
  const searchResultsDiv = document.getElementById("searchResults");
  searchResultsDiv.innerHTML =
    "<p>No vehicles found with the provided information.</p>";
}

async function displaySearchResultsForVehicle(results) {
  const searchResultsDiv = document.getElementById("searchResults");
  searchResultsDiv.innerHTML = "";

  for (const [index, result] of results.entries()) {
    try {
      database
        .from("People")
        .select("*")
        .eq("PersonID", result.OwnerID)
        .then((response) => {
          if (response.error === null) {
            result.Name = response.data[index].Name;
            result.LicenseNumber = response.data[index].LicenseNumber;
            const button = document.createElement("button");
            button.style.height = "auto";
            button.style.fontSize = "15px";
            button.textContent = `${result.Make} ${result.Model}`;
            button.classList.add("result-button");
            button.setAttribute("data-index", index);
            button.setAttribute("data-key", "PlateNumber");
            button.setAttribute("data-info", JSON.stringify(result));
            button.addEventListener("click", showAttributesForVehicle);
            searchResultsDiv.appendChild(button);
          } else {
            const button = document.createElement("button");
            button.style.height = "auto";
            button.style.fontSize = "15px";
            button.textContent = `${result.Make} ${result.Model}`;
            button.classList.add("result-button");
            button.setAttribute("data-index", index);
            button.setAttribute("data-key", "PlateNumber");
            button.setAttribute("data-info", JSON.stringify(result));
            button.addEventListener("click", showAttributesForVehicle);
            searchResultsDiv.appendChild(button);
          }
        });
    } catch (error) {
      console.error("Error fetching person details:", error);
    }
  }
}

function showAttributesForVehicle() {
  const resultInfo = JSON.parse(this.getAttribute("data-info"));

  if (!resultInfo) return;

  if (!this.classList.contains("expanded")) {
    let attributes = '<div style="text-align: left; padding-top: 10px;">';
    for (const key in resultInfo) {
      if (resultInfo.hasOwnProperty(key)) {
        attributes += `<div>${key}: ${resultInfo[key]}</div>`;
      }
    }
    attributes += "</div>";
    this.innerHTML = attributes;
    this.classList.add("expanded");
  } else {
    this.textContent = `${resultInfo.Make} ${resultInfo.Model}`;
    this.style.height = "auto";
    this.classList.remove("expanded");
  }
}

var dismissCount = 1;

async function registerNewUser() {
  const id = document.getElementById("ownerId").value;
  const name = document.getElementById("name").value;
  const address = document.getElementById("address").value;
  const dob = document.getElementById("dob").value;
  const licenseNumber = document.getElementById("licenseNumber").value;
  const expiryDate = document.getElementById("expiryDate").value;

  await database
    .from("People")
    .insert([
      {
        PersonID: id,
        Name: name,
        Address: address,
        DOB: dob,
        LicenseNumber: licenseNumber,
        ExpiryDate: expiryDate,
      },
    ])
    .then((response) => {
      alert("User registered successfully!");
      addVehicleToDatabase();
      document.getElementById("newUserForm").style.display = "none";
      document.getElementById("overlay").style.display = "none";
    })
    .catch((error) => {
      console.error("Error registering user:", error);
      alert("Failed to register user.");
    });
}

function dismiss() {
  const newUserForm = document.getElementById("newUserForm");
  const overlay = document.getElementById("overlay");

  if (newUserForm && overlay) {
    newUserForm.style.display = "none";
    overlay.style.display = "none";
  }
}

async function addVehicleToDatabase() {
  const vehicleID = document.getElementById("registrationPlate").value;
  const make = document.getElementById("make").value;
  const model = document.getElementById("model").value;
  const color = document.getElementById("color").value;
  const ownerId = document.getElementById("ownerId").value;
  database
    .from("Vehicles")
    .insert([
      {
        VehicleID: vehicleID,
        Make: make,
        Model: model,
        Colour: color,
        OwnerID: ownerId,
      },
    ])
    .select()
    .then((response) => {
      if (response.error) {
        const addButton = document.querySelector("body main div button");
        addButton.style.backgroundColor = "red";
        addButton.textContent = "Failed to add vehicle";
        setTimeout(function () {
          addButton.textContent = "Add vehicle";
          addButton.style.backgroundColor = "#ff7300";
        }, 2000);
      } else {
        const addButton = document.querySelector("body main div button");
        addButton.style.backgroundColor = "green";
        addButton.textContent = "Vehicle added successfully";
        setTimeout(function () {
          window.location.reload();
        }, 2000);
      }
    })
    .catch((error) => {
      console.error("Error adding vehicle:", error);
      const addButton = document.querySelector("body main div button");
      addButton.style.backgroundColor = "red";
      addButton.textContent = "Failed to add vehicle";
    });
}
async function addVehicle(vehicleID, make, model, color, ownerId) {
  if (
    !database ||
    vehicleID.trim() === "" ||
    make.trim() === "" ||
    model.trim() === "" ||
    color.trim() === "" ||
    ownerId.trim() === ""
  ) {
    console.error("Supabase is not initialized or required fields are missing");
    return;
  }

  let existingUser = await database
    .from("People")
    .select("*")
    .eq("PersonID", ownerId)
    .then((response) => {
      return response.data.length > 0;
    });

  if (!existingUser) {
    const newUserForm = document.createElement("div");
    newUserForm.innerHTML = `
      <div id="newUserForm">
        <a>There is no person with that Owner ID. Add this person to the People table.</a>
        <input type="text" id="name" name="name" required placeholder="Name">
        <input type="text" id="address" name="address" required placeholder="Address">
        <input type="text" id="dob" name="dob" required placeholder="Date of Birth (dd.mm.yyyy)">
        <input type="text" id="licenseNumber" name="licenseNumber" required placeholder="License Number">
        <input type="text" id="expiryDate" name="expiryDate" required placeholder="Expiry Date (dd.mm.yyyy)">
        <div id="newUserFormButtons">
          <button onclick="registerNewUser()">Add Person</button>
          <button onclick="dismiss()">Dismiss</button>
        </div>
      </div>
    `;
    document.body.appendChild(newUserForm);
    const overlay = document.createElement("div");
    overlay.setAttribute("id", "overlay");
    overlay.style =
      "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5); z-index: 999;";
    document.body.appendChild(overlay);
  } else {
    addVehicleToDatabase();
  }
}

function handleKeyPressForVehicleAdding(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    addVehicle(
      document.getElementById("registrationPlate").value,
      document.getElementById("make").value,
      document.getElementById("model").value,
      document.getElementById("color").value,
      document.getElementById("ownerId").value
    );
  }
}
