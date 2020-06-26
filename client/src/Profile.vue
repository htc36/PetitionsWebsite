<template>
  <div id="app">
    <NavBar></NavBar>
    <div class="container">
      <div>
        <b-row>
          <b-img v-if="userImage === false" center rounded= "circle" width="150" height="150" src="https://www.signtech.co.nz/wp-content/uploads/2019/08/facebook-blank-face-blank.jpg" alt="No photo"></b-img>
          <b-img v-if="userImage !== false" center rounded= "circle" :src="userImage" alt="" width="150" height="150"></b-img>
        </b-row>
        <b-row><h3></h3></b-row>
        <b-row align-h="center">
          <h3>{{name}} </h3>
        </b-row>
            <b-card style="margin: 1em" title="About:">
              <b-row>
                <b-col><b>Email</b></b-col>
                <b-col><p>{{email}}</p></b-col>
              </b-row>
              <b-row>
                <b-col><b>Country:</b></b-col>
                <b-col v-if="country != ''"><p >{{country}}</p></b-col>
                <b-col v-else><p>-</p></b-col>
              </b-row>
              <b-row>
                <b-col><b>City</b></b-col>
                <b-col v-if="city != ''"><p >{{city}}</p></b-col>
                <b-col v-else><p>-</p></b-col>
              </b-row>
            </b-card>
        <b-card style="margin: 1em" title="Your Petitions:">
          <PetitionsList onProfilePage="true"></PetitionsList>

        </b-card>
      </div>

    </div>
  </div>
</template>



<script>
  import NavBar from './assets/NavBar.vue';

  import Vue from "vue";
  import axios from "axios";
  import PetitionsList from "./assets/PetitionsList";


  const App = {
    //name: 'App',
    components: {
      NavBar,
      PetitionsList
    },
    data: function() {
      return {
        name: '',
        email: '',
        city: '',
        country:'',
        userImage:false
      }
    },
    methods: {
      getUserSession: function () {
        let currentObj = this;
        this.axios.defaults.headers.common['X-Authorization'] = localStorage.getItem('token');
        this.axios.get('http://45.76.124.20:4941/api/v1/users/' + localStorage.getItem("user"))
          .then(function (response) {
            currentObj.name = JSON.stringify(response.data.name).slice(1, -1);
            currentObj.city = response.data.city != null ? JSON.stringify(response.data.city).slice(1, -1) : ""
            currentObj.country = response.data.country != null ? JSON.stringify(response.data.city).slice(1, -1) : ""
            currentObj.email = JSON.stringify(response.data.email).slice(1, -1);
            currentObj.getUserImage(localStorage.getItem(("user")))
          })
          .catch(function (err) {
            alert(err);
            localStorage.clear();
            currentObj.$router.push('/login');

          });
      },
      getUserImage: function (id) {
        const currentObj = this;
        Vue.axios.get('http://45.76.124.20:4941/api/v1/users/' + id + '/photo', { responseType: 'blob' })
          .then(function (response){
            let fileReader = new FileReader();
            fileReader.readAsDataURL(response.data);
            fileReader.onload = () => {
              currentObj.userImage = fileReader.result;
            }
          })
          .catch(err => {
          });
      }
    },
    mounted: function () {
      this.getUserSession();

    }
  };

  export default App;
</script>
