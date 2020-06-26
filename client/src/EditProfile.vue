<template>
  <div id="app">
    <NavBar></NavBar>
    <div class="container">
      <b-container fluid>
        <b-row>
          <b-col>
            <h1>Edit Account</h1>
            <hr>
          </b-col>
        </b-row>
        <b-form novalidate @submit.stop.prevent="onSubmit">
          <b-row class="my-1">
            <b-col align-self="stretch" align="center">
              <b-avatar :src="imageData" size="16.5em"></b-avatar>
              <br><br>

              <b-form-file
                placeholder="Image"
                v-model ="imageName"
                @change="previewImage"
                accept=".jpg, .png, .gif, .jpeg"
              ></b-form-file>
              <div align="left" v-if="imageData != '' && noImage != true">
              <b-button variant="danger" @click="deletePhoto">Delete Photo</b-button>
              </div>
            </b-col>
            <b-col sm="6">
              <div>
                <label>Full Name</label>
                <b-form-input id="input-default" placeholder="Enter name" :state="validateState('fullName')" v-model ="$v.fullName.$model" required trim></b-form-input>
                <b-form-invalid-feedback>Invalid first name</b-form-invalid-feedback>
                <b-form-text>Required</b-form-text>
              </div>
              <div>
                <label>Email address</label>
                <b-form-input id="email" type="email" placeholder="Enter email address" :state="validateState('primary_email')" v-model ="$v.primary_email.$model" required trim v-on:input="serverCheckReset"></b-form-input>
                <b-form-invalid-feedback>{{emailErrMsg}}</b-form-invalid-feedback>
                <b-form-text>Required</b-form-text>
              </div>
              <div>
                <label>City</label>
                <b-form-input id="input-default" placeholder="Enter country" :state="validateState('city')" v-model ="$v.city.$model" ></b-form-input>
                <b-form-invalid-feedback>Invalid City</b-form-invalid-feedback>
              </div>
              <div>
                <label>Country</label>
                <b-form-input id="input-default" placeholder="Enter country" :state="validateState('country')" v-model ="$v.country.$model" ></b-form-input>
                <b-form-invalid-feedback>Invalid Country</b-form-invalid-feedback>
              </div>
            </b-col>
          </b-row>
          <br>
          <b-button v-b-modal.modal-prevent-closing >Edit Password</b-button>
          <b-button type="submit" variant="primary" >Submit</b-button>
        </b-form>
        <br>
        <b-alert variant="success" show v-if="passChanged">Password Updated!</b-alert>


        <b-modal
              id="modal-prevent-closing"
              ref="modal"
              title="Edit Password"
              @show="resetModal"
              @hidden="resetModal"
              @ok="handleOk"
            >
              <form ref="form" @submit.stop.prevent="handleSubmit">
                <label>Current Password</label>
                <b-form-input type="password" id="input-default" placeholder="Enter password" v-model = oldPassword required :state="currentPassState"></b-form-input>
                <label>New Password</label>
                <b-form-input type="password" id="input-default" placeholder="Enter password" v-model = password :state="newPassState"></b-form-input>
                <label>Repeat New Password</label>
                <b-form-input type="password" id="input-default" placeholder="Enter password" v-model = passwordRepeat :state="newPassRepeatState"></b-form-input>
                <b-form-invalid-feedback> Password must contain at least 8 characters with at least one digit, one lower case, one upper case</b-form-invalid-feedback>
                <b-form-text>Required</b-form-text>
                <label id="errorFeedback"></label>

              </form>
            </b-modal>


      </b-container>
    </div>
  </div>

</template>

<script>
  import {alphaNum, email, helpers, required, sameAs} from 'vuelidate/lib/validators'
  import NavBar from "./assets/NavBar";
  import Vue from "vue";

  const passwordValidate = helpers.regex('passwordValidate', new RegExp("^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$"));
  const nameValidate = helpers.regex('nameValidate', /^[a-zA-Z]+(([' -][a-zA-Z ])?[a-zA-Z]*)*$/); // Some names have ' or - or spaces so can't use alpha
  export default {
    components: {
      NavBar
    },
    data() {
      return {
        passChanged:false,
        imageData: '',
        fullName: null,
        password: null,
        primary_email: null,
        passwordRepeat: '',
        oldPassword: '',
        city: null,
        country: null,
        serverError: true,
        isLoggedIn:true,
        imageName:null,
        loggedInUser:localStorage.getItem("user"),
        noImage : null,

        emailErrMsg: "Invalid Email",



        nameState: null,
        submittedNames: [],
        currentPassState: null,
        newPassState: null,
        newPassRepeatState: null
      }
    },
    validations: {
      fullName: {
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
      city: {
        nameValidate
      },
      country: {
        nameValidate
      },
    },
    methods: {
      deletePhoto: function() {
        const currentObj = this
        this.axios.delete('http://45.76.124.20:4941/api/v1/users/' + this.loggedInUser + '/photo')
          .then(function (response) {
            currentObj.imageData = ''

          })
          .catch(function (error) {
            alert(error)
          });

      },
      previewImage: function(event) {
        let userPhoto = event.target;
        if (userPhoto.files && userPhoto.files[0]) {
          let reader = new FileReader();
          reader.onload = (e) => {
            this.imageData = e.target.result;
          }
          reader.readAsDataURL(userPhoto.files[0]);
        }
      },
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
          "name" : this.fullName,
          "email" : this.primary_email,
        }

        if(this.city!= "") {
          sendData["city"] = this.city
        }
        if(this.country!= "") {
          sendData["country"] = this.city
        }
        this.axios.patch('http://45.76.124.20:4941/api/v1/users/' + this.loggedInUser,
          sendData)
          .then(function (response) {
            if (currentObj.imageName != null) {
              currentObj.setImage()
            }else {
              currentObj.$router.push("/profile")
            }
          })
          .catch(function (error) {
            alert(error)
            currentObj.serverError = false;
            currentObj.$v.$reset();
            currentObj.$v.$touch();
            return;
          });
      },
      setImage: function () {
        const currentObj = this
        this.axios.defaults.headers.common['X-Authorization'] = localStorage.getItem('token');
        this.axios.put('http://45.76.124.20:4941/api/v1/users/' + this.loggedInUser + "/photo",
          this.imageName,
          {headers: {
              "Content-Type": this.imageName.type
            }
          })
          .then(function (response) {
            currentObj.$router.push("/profile")
          })
          .catch(function (error) {
            alert(error);
          });
      },
      getUserSession: function () {
        let currentObj = this;
        this.axios.defaults.headers.common['X-Authorization'] = localStorage.getItem('token');
        this.axios.get('http://45.76.124.20:4941/api/v1/users/' + localStorage.getItem("user"))
          .then(function (response) {
            currentObj.fullName = JSON.stringify(response.data.name).slice(1, -1);
            currentObj.city = response.data.city != null ? JSON.stringify(response.data.city).slice(1, -1) : ""
            currentObj.country = response.data.country != null ? JSON.stringify(response.data.city).slice(1, -1) : ""
            currentObj.primary_email = JSON.stringify(response.data.email).slice(1, -1);
            currentObj.getUserImage(localStorage.getItem(("user")))
          })
          .catch(function (err) {
            alert(err);
            localStorage.clear();
            currentObj.$router.push('#/login');

          });
      },
      getUserImage: function (id) {
        const currentObj = this;
        Vue.axios.get('http://45.76.124.20:4941/api/v1/users/' + id + '/photo', { responseType: 'blob' })
          .then(function (response){
            let fileReader = new FileReader();
            fileReader.readAsDataURL(response.data);
            fileReader.onload = () => {
              currentObj.imageData = fileReader.result;
            }
          })
          .catch(err => {
            currentObj.noImage = true
          });
      },
      serverCheckReset() {
        if (!this.serverError) {
          this.emailErrMsg = "Invalid Email";
          this.serverError = true;
        }
      },

      checkFormValidity() {
        let pattern = new RegExp("^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$");
        const state = pattern.test(this.password);
        if(this.password !== this.passwordRepeat || state === false){
          return false;
        }
        return true;
      },
      resetModal() {
        this.password = ''
        this.passwordRepeat = ''
        this.oldPassword = ''
      },
      handleOk(bvModalEvt) {
        // Prevent modal from closing
        bvModalEvt.preventDefault()
        // Trigger submit handler
        this.handleSubmit()
      },
      handleSubmit() {
        // Exit when the form isn't valid
        if (!this.checkFormValidity()){
          document.getElementById("errorFeedback").textContent = "Password must contain at least 8 characters with at least one digit, one lower case, one upper case and match password repeat";
          return;
        }
        const currentObj = this;
        this.axios.patch('http://45.76.124.20:4941/api/v1/users/' + this.loggedInUser, {
          password: this.password,
          currentPassword: this.oldPassword,
        })
          .then(function (response) {
            currentObj.resetModal();
            currentObj.$nextTick(() => {
              currentObj.$bvModal.hide('modal-prevent-closing')
            })
          })
          .catch(err => {
            document.getElementById("errorFeedback").textContent = "Incorrect current password";
          });
        currentObj.passChanged = true
      }
    },
    mounted: function () {
      this.getUserSession();
      //this.isLoggedIn = localStorage.getItem('token') != null

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
  #errorFeedback {
    color: red;
  }
</style>
