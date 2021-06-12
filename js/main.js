/*********************************************************************************
 * WEB422 – Assignment 2
 * I declare that this assignment is my own work in accordance with Seneca Academic Policy.
 * No part of this assignment has been copied manually or electronically from any other source
 * (including web sites) or distributed to other students.
 *
 * Name: Seung Woo Ji Student ID: 116376195 Date: June 9, 2021
 *
 *
 ********************************************************************************/

let restaurantData = [];
let currentRestaurant = {};
let page = 1; // current page number
let perPage = 10;
let map = null; // leaflet map object

function avg(grades) {
  let scores = _.map(grades, 'score'); // extract the score values to a new array

  let total = _.reduce(scores, (sum, score) => sum + score, 0);

  return (total / grades.length).toFixed(2);
}

let tableRows = _.template(
  `<% _.forEach(restaurants, function(restaurant) { %>
        <tr data-id= <%- restaurant._id %>>
            <td><%- restaurant.name %></td>
            <td><%- restaurant.cuisine %></td>
            <td><%- restaurant.address.building %> <%- restaurant.address.street %></td>
            <td><%- avg(restaurant.grades) %></td>
        </tr>
    <% }); %>`
);

function loadRestaurantData() {
  fetch(`https://enigmatic-sea-88422.herokuapp.com/api/restaurants?page=${page}&perPage=${perPage}`)
    .then((response) => response.json())
    .then((data) => {
      restaurantData = data;
      let rows = tableRows({ restaurants: data });

      $('tbody').html(rows);
      $('#current-page').html(page);
    })
    .catch((err) => {
      console.error('Unable to load restaurant data: ', err);
    });
}

$(function () {
  loadRestaurantData();

  // click event for all tr elements within the tbody of the restaurant-table
  $('#restaurant-table tbody').on('click', 'tr', function () {
    let id = $(this).attr('data-id');
    let isFound = false;

    for (let i = 0; i < restaurantData.length && !isFound; ++i) {
      if (restaurantData[i]._id === id) {
        currentRestaurant = _.cloneDeep(restaurantData[i]);
        isFound = true;
      }
    }

    $('.modal-title').html(currentRestaurant.name);
    $('#restaurant-address').html(`${currentRestaurant.address.building} ${currentRestaurant.address.street}`);
    $('#restaurant-modal').modal('show');
  });

  // click event for the "previous page" pagination button
  $('#previous-page').on('click', function () {
    if (page > 1) {
      page--;
      loadRestaurantData();
    }
  });

  // click event for the "next page" pagination button
  $('#next-page').on('click', function () {
    page++;
    loadRestaurantData();
  });

  // shown.bs.modal event for the "Restaurant" modal window
  $('#restaurant-modal').on('shown.bs.modal', function () {
    map = new L.Map('leaflet', {
      center: [currentRestaurant.address.coord[1], currentRestaurant.address.coord[0]],
      zoom: 18,
      layers: [new L.TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')],
    });

    L.marker([currentRestaurant.address.coord[1], currentRestaurant.address.coord[0]]).addTo(map);
  });

  // hidden.bs.modal event for the "Restaurant" modal window
  $('#restaurant-modal').on('hidden.bs.modal', function () {
    map.remove();
  });
});
