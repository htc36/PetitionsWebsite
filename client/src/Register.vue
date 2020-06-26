<template>
  <div id="app">
    <NavBar></NavBar>
    <div class="container">
      <b-container fluid>
        <b-row>
          <b-col>
            <h1>Create a new account</h1>
            <hr>
          </b-col>
        </b-row>
        <b-form novalidate @submit.stop.prevent="onSubmit">
          <b-row class="my-1">
            <b-col sm="6">
              <label>Full Name</label>
              <b-form-input id="input-default" placeholder="Enter name" :state="validateState('firstname')" v-model ="$v.firstname.$model" required trim></b-form-input>
              <b-form-invalid-feedback>Invalid first name</b-form-invalid-feedback>
              <b-form-text>Required</b-form-text>
            </b-col>

            <b-col sm="6">
              <label>Email address</label>
              <b-form-input id="email" type="email" placeholder="Enter email address" :state="validateState('primary_email')" v-model ="$v.primary_email.$model" required trim v-on:input="serverCheckReset"></b-form-input>
              <b-form-invalid-feedback>{{emailErrMsg}}</b-form-invalid-feedback>
              <b-form-text>Required</b-form-text>
            </b-col>
          </b-row>
          <b-row class="my-1">
            <b-col sm="6">
              <label>City</label>
              <b-form-input id="input-default" placeholder="Enter country" :state="validateState('city')" v-model ="$v.city.$model" ></b-form-input>
              <b-form-invalid-feedback>Invalid City</b-form-invalid-feedback>
            </b-col>

            <b-col sm="6">
              <label>Country</label>
              <b-form-input id="input-default" placeholder="Enter country" :state="validateState('country')" v-model ="$v.country.$model" ></b-form-input>
              <b-form-invalid-feedback>Invalid Country</b-form-invalid-feedback>
            </b-col>
          </b-row>
          <b-row class="my-3">
            <b-col sm="6">
              <label>Password</label>
              <b-form-input type="password" id="input-default" placeholder="Enter password" :state="validateState('password')" v-model ="$v.password.$model" required></b-form-input>
              <b-form-invalid-feedback> Password must contain at least 8 characters with at least one digit, one lower case, one upper case</b-form-invalid-feedback>
              <b-form-text>Required</b-form-text>
            </b-col>

            <b-col sm="6">
              <label>Repeat Password</label>
              <b-form-input id="input-default" type="password" placeholder="Enter password again" :state="validateState('passwordRepeat')" v-model ="$v.passwordRepeat.$model" required></b-form-input>
              <b-form-invalid-feedback id="email-error"> Passwords must be the same</b-form-invalid-feedback>
              <b-form-text>Required</b-form-text>
            </b-col>

          </b-row >
          <b-row class='my-1'>
            <b-col sm="4">
              <lable>Profile Image</lable>
            <b-form-file accept=".jpg, .png, .gif" v-model="imageName"></b-form-file>
              <b-form-text>PNG,JPEG,JPG,GIF</b-form-text>
            </b-col>
          </b-row>
          <b-button type="submit" variant="primary" >Submit</b-button>

        </b-form>
      </b-container>
    </div>
  </div>

</template>

<script>
  import {alphaNum, email, helpers, required, sameAs} from 'vuelidate/lib/validators'
  import NavBar from "./assets/NavBar";

  const passwordValidate = helpers.regex('passwordValidate', new RegExp("^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$"));
  const nameValidate = helpers.regex('nameValidate', /^[a-zA-Z]+(([' -][a-zA-Z ])?[a-zA-Z]*)*$/); // Some names have ' or - or spaces so can't use alpha
  export default {
    components: {
      NavBar
    },
    data() {
      return {
        firstname: null,
        password: null,
        primary_email: null,
        passwordRepeat: null,
        city: "",
        country: "",
        serverError: true,
        imageName:null,
        emailErrMsg: "Invalid Email"
      }
    },
    validations: {
      firstname: {
        required,
        nameValidate
      },
      primary_email: {
        required,
        email,
        serverCheck() {
          return this.serverError;
        }
      },
      password: {
        required,
        passwordValidate
      },
      passwordRepeat: {
        required,
        sameAsPassword: sameAs('password')
      },
      city: {
        nameValidate
      },
      country: {
        nameValidate
      },
    },
    methods: {
      validateState: function(name) {
        const { $dirty, $error } = this.$v[name];
        return $dirty ? !$error : null;
      },
      onSubmit: function () {
        this.$v.$touch();
        if (this.$v.$anyError) {
          return;
        }
        let currentObj = this;
        // this.axios.defaults.withCredentials = true;
        let sendData = {
          name: this.firstname,
          password: this.password,
          email: this.primary_email
        };
        if (this.city!= "") {
          sendData["city"] = this.city
        }if (this.country != ""){
          sendData["country"] = this.country
        }

        this.axios.post('http://45.76.124.20:4941/api/v1/users/register',
          sendData)
          .then(function (response) {
            currentObj.login();
          })
          .catch(function (error) {
            alert(error);
            currentObj.serverError = false;
            currentObj.$v.$reset();
            currentObj.$v.$touch();
            return;
          });
      },
      login: function () {
        let currentObj = this;
        this.axios.post('http://45.76.124.20:4941/api/v1/users/login', {
          email: this.primary_email,
          password: this.password,
        })
          .then(function (response) {
            const id = JSON.stringify(response.data.userId);
            localStorage.setItem('user',id);
            localStorage.setItem('token',response.data.token);
            if (currentObj.imageName != null) {
              currentObj.setImage(id);
            }
            currentObj.$router.push('#/profile');
          })
          .catch(function (error) {
            console.log(error);
          });

      },
      setImage: function (id) {
        this.axios.defaults.headers.common['X-Authorization'] = localStorage.getItem('token');
        this.axios.put('http://45.76.124.20:4941/api/v1/users/' + id + "/photo",
          this.imageName,
          {headers: {
              "Content-Type": this.imageName.type
            }
        })
          .then(function (response) {
          })
          .catch(function (error) {
            alert(error);
          });
      },
      serverCheckReset() {
        if (!this.serverError) {
          this.emailErrMsg = "Invalid Email";
          this.serverError = true;
        }
      }
    }
  }

</script>


<style scoped>
  [v-cloak] {
    display: none;
  }

  .container {
    background-color: #f2f2f2;
    padding: 20px 20px 20px 20px;
    border: 1px solid lightgrey;
    border-radius: 3px;

  }
</style>
