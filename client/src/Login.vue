<template>
  <div id ="app">
    <NavBar></NavBar>
    <div class="container" >
      <b-container fluid>
        <b-row>
          <b-col>
            <h3>Login</h3>
            <hr>
          </b-col>
        </b-row>
        <b-form @submit="onSubmit">
        <b-row>
          <b-col sm="1">
            <label align="right">Email</label>
          </b-col>
          <b-col sm="12">
            <b-form-input id="input-default" placeholder="Enter name" type="email" v-model="email"></b-form-input>
          </b-col>
        </b-row>
        <b-row class="my-2">
          <b-col sm="1">
            <label align="right">Password</label>
          </b-col>
          <b-col sm="12">
            <b-form-input id="input-default" placeholder="Enter password" type="password" v-model ="password"></b-form-input>
          </b-col>
        </b-row>
        <b-row class="my-1">
            <label id="errorFeedback"></label>
        </b-row>
        <b-row class="my-1">
          <b-col sm="1">
            <b-button type="submit" variant="primary">Submit</b-button>
          </b-col>
        </b-row>
          <p id="user-error-feedback"></p>
        </b-form>
      </b-container>
        <a href="/register" id="signup-link">Register</a>
    </div>
  </div>
</template>

<script>
  import NavBar from "./assets/NavBar";

  export default {
    components: {
      NavBar
    },
    data() {
      return {
        email: '',
        password: '',
        show: true,
      }
    },
    methods: {
      onSubmit: function (e) {
        let currentObj = this;
        //this.axios.defaults.withCredentials = true;
        this.axios.post('http://localhost:4941/api/v1/users/login', {
          email: this.email,
          password: this.password
        })
          .then(function (response) {
            localStorage.setItem('user', JSON.stringify(response.data.userId));
            localStorage.setItem('token', response.data.token);
            console.log(JSON.stringify((response.data.userId)))
            console.log(JSON.stringify((response.data.token)))
            currentObj.$router.push('/profile');
            currentObj.isLoggedIn = true;
          })
          .catch(function (error) {
            currentObj.output = error;
            console.log(error);
            document.getElementById("errorFeedback").textContent = "Error email/password incorrect";
          });
        e.preventDefault();
      },
    },
    mounted: function () {
      //this.onSubmit();
    }
  }
</script>

<style scoped>
  [v-cloak] {
    display: none;
  }

  .container {
    background-color: #f2f2f2;
    padding: 5px 40px 15px 20px;
    border: 1px solid lightgrey;
    border-radius: 3px;
    width: 500px;
    height: 100%
  }

  #errorFeedback {
    color: red;
    font-size: 12px;
    padding-left: 14px;
  }

  .b-container {
    background-color: red;
    border: 0 white;
  }

</style>



