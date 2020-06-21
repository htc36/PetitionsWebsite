<template>
  <div >
    <NavBar></NavBar>
    <div >
    <b-container fluid id="content">
      <b-row style="margin-bottom:10px;">
        <b-col>
          <h1 style="text-align:center;"> Create Petition </h1>
        </b-col>
      </b-row>

      <b-form novalidate @submit.stop.prevent="onSubmit">
        <b-row>
          <b-col>
  <!--            <b-img :src="this.petitionImage" fluid></b-img>-->
            <div v-if="imageData ==''">
              <b-img src="https://cdn.pixabay.com/photo/2014/03/24/17/16/paper-295243_960_720.png" width = 400% height = 300%></b-img>
            </div>
            <div v-else>
              <b-img :src="imageData" width = 400% height="300%"></b-img>
            </div>
            <br>

            <b-form-file
              placeholder="Required*"
              :state="validateState('file')"
              v-model="$v.file.$model"
              @change="previewImage"
              accept=".jpg, .png, .gif, .jpeg"
            />
            <b-form-invalid-feedback>Required</b-form-invalid-feedback>
          </b-col>
          <b-col>
            <p align="left">Title*
            <b-form-input id="input-default" placeholder="Enter name" :state="validateState('title')" v-model ="$v.title.$model" trim></b-form-input>
              <b-form-invalid-feedback>Required</b-form-invalid-feedback>
            </p>

            <p align="left">
              Description*
              <b-form-textarea id="input-default" placeholder="Enter description" :state="validateState('description')" v-model ="$v.description.$model" ></b-form-textarea>
              <b-form-invalid-feedback>Required</b-form-invalid-feedback>
            </p>
            <p align="left">
              Category*
              <b-form-select :options="options" :state="validateState('category')" v-model ="$v.category.$model" ></b-form-select>
              <b-form-invalid-feedback>Required</b-form-invalid-feedback>

            </p>
            <p align="left">
              Closing Date
              <b-form-input type="date" id="example-datepicker" :state="validateState('date')" v-model ="$v.date.$model"  class="mb-2"></b-form-input>
              <b-form-invalid-feedback>Date must be in the future</b-form-invalid-feedback>
            </p>
            <div v-if="date != '' && validateState('date')">
              <p align="left">
                Time*<br>
                <b-time hide-header v-model="$v.time.$model" :state="validateState('time')" locale="en" @context="onContext"></b-time>
              </p>
              <label id="invalidTime"></label>
              <b-form-invalid-feedback >Bad</b-form-invalid-feedback>

            </div>

            <p align="right">
              <b-button type="submit" variant="primary">Submit</b-button>
            </p>
          </b-col>
        </b-row>
      </b-form>
    </b-container>
    </div>
  </div>


</template>


<script>
  import {alphaNum, email, helpers, required, sameAs} from 'vuelidate/lib/validators'

  import NavBar from "./assets/NavBar";

  export default {
    components: {
      NavBar
    },
    data() {
      return {
        title:"",
        description:"",
        selected:null,
        // options:[{value: null, text: 'Please select an option'}]
        options:[],
        petitionImage:null,
        category:null,
        file:"",
        image:null,
        date:"",
        imageData:"",

        time: '',
        context: null
      }
    },
    validations: {
      title: {
        required,
      },
      description: {
        required,
      },
      category: {
        required,
      },
      file: {
        required,
      },
      time: {
      },
      date: {
        dateValidate(value) {
          const date = new Date(value);
          const today = new Date();
          if (value == "") {
            return true
          }
          return date >= today;
        },

      },

    },

    methods: {
      validateState: function(name) {
        const { $dirty, $error } = this.$v[name];
        return $dirty ? !$error : null;
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

      getCategories() {
        const currectObj = this;
        this.axios.get('http://localhost:4941/api/v1/petitions/categories')
          .then((res) => {
            const data = res.data;
            for (let i = 0; i < data.length; i++) {
              currectObj.options.push({value: data[i].categoryId, text: data[i].name})
            }
            })
          .catch(err => alert(err));
      },
      onSubmit: function () {
        this.$v.$touch();
        if (this.$v.$anyError) {
          return;
        }
        const currectObj = this;
        let toSend = {
            "title" : this.title,
            "categoryId" : this.category,
            "description": this.description,
        }
        if (this.date != "") {
          if(this.time == ""){
            document.getElementById("invalidTime").textContent = "Please enter a valid time"
            return;
          }
          const dateString = this.date + "T" + this.time
          toSend["closingDate"] = dateString
        }
        this.axios.defaults.headers.common['X-Authorization'] = localStorage.getItem('token');
        this.axios.post('http://localhost:4941/api/v1/petitions',
          toSend
        )
          .then((res) => {
            const id = res.data.petitionId
            this.axios.put('http://localhost:4941/api/v1/petitions/' + id + "/photo",
              this.file,
              {headers: {
                  "Content-Type": this.file.type
                }
              })
              .then(function (response) {
                currectObj.axios.post('http://localhost:4941/api/v1/petitions/' + id + "/signatures")
                  .then(function (response) {
                    currectObj.$router.push('/petition/' + id);
                  })
                  .catch(function (error) {
                    alert(error);
                  });
              })
              .catch(function (error) {
                alert(error);
              });

          })
          .catch(err => alert(err));
      },
      onContext(ctx) {
        this.context = ctx
      }
    },
    watch: {
      'file': function () {
      }



    },


    mounted: function () {
      this.getCategories()
    }
  }
</script>

<style scoped>
  #content{
    width: 50%;

  }
  b-container{

    width:100px
  }

</style>



