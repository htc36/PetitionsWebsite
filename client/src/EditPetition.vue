<template>
  <div v-if="ready">
    <NavBar></NavBar>
    <div >
    <b-container fluid id="content">
      <b-row style="margin-bottom:10px;">
        <b-col>
          <h1 style="text-align:center;"> Edit Petition </h1>
        </b-col>
      </b-row>

      <b-form novalidate @submit.stop.prevent="onSubmit">
        <b-row>
          <b-col>
  <!--            <b-img :src="this.petitionImage" fluid></b-img>-->
            <br>
<!--            <b-avatar square variant="light" src="" size="10rem" ></b-avatar>-->
<!--            <b-avatar square variant="light" :src=imageData size="10rem" ></b-avatar>-->

            <div v-if="imageData ==''">
              <b-img src="https://cdn.pixabay.com/photo/2014/03/24/17/16/paper-295243_960_720.png" width = 400% height = 300%></b-img>
            </div>
            <div v-else>
            <b-img :src="imageData" width = 400% height="300%"></b-img>
            </div>
            <br>
            <b-form-file
              placeholder="Current Image"
              :state="validateState('imageData')"
              v-model ="$v.file.$model"
              @change="previewImage"
              accept=".jpg, .png, .gif, .jpeg"
            ></b-form-file>
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
              <b-form-select value-field="item" text-field="name" :options="options" :state="validateState('category')" v-model ="$v.category.$model" ></b-form-select>
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
                <b-button variant="danger" @click="goBack">Cancel</b-button>
                <b-button type="submit" variant="primary" >Submit</b-button>
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
        selected:2,
        // options:[{value: null, text: 'Please select an option'}]
        options:[],
        petitionImage:null,
        category:null,
        image:null,
        date:"",
        ready:false,
        time: '',
        context: null,
        imageData:"",
        id: null,
        photo:null,
        file:null,

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
      imageData: {
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
          return date >= today ;
        },

      },

    },

    methods: {
      goBack: function() {
        this.$router.push('/petition/' + this.id);
      },
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
      getPetitionImage: function() {
        const currentObj = this
        this.axios.get('http://45.76.124.20:4941/api/v1/petitions/' + this.id + "/photo", { responseType: 'blob' })
          .then((res) => {
            this.file = res.data
            let fileReader = new FileReader();
            fileReader.readAsDataURL(res.data);
            fileReader.onload = () => {
              currentObj.imageData = fileReader.result;
            }
          })
          .catch(err => alert(err));

      },
      getCategories(category) {
        const currectObj = this;
        this.axios.get('http://45.76.124.20:4941/api/v1/petitions/categories')
          .then((res) => {
            const data = res.data;
            for (let i = 0; i < data.length; i++) {
              if (data[i].name === category){
                this.category = data[i].categoryId
              }
              currectObj.options.push({item: data[i].categoryId, name: data[i].name})
            }
            })
          .catch(err => alert(err));
        this.$v.$reset()
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
          toSend["closingDate"] = this.date + "T" + this.time
        }
        this.axios.defaults.headers.common['X-Authorization'] = localStorage.getItem('token');
        this.axios.patch('http://45.76.124.20:4941/api/v1/petitions/' + this.id,
          toSend
        )
          .then((res) => {
            // currectObj.$router.push("/petition/" + this.id)
            this.axios.put('http://45.76.124.20:4941/api/v1/petitions/' + this.id + "/photo",
              this.file,
              {headers: {
                  "Content-Type": currectObj.file.type
                }
              })
              .then(function (response) {
                currectObj.$router.push('/petition/' + currectObj.id);
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
    },


    mounted: function () {
      this.id = this.$route.params.id
      this.axios.get('http://45.76.124.20:4941/api/v1/petitions/' + this.id)
        .then((res) => {
          if(res.data.authorId != localStorage.getItem("user")){
            this.$router.push('/petition');
            this.title = res.data.title
            this.category = res.data.category
            this.description = res.data.description
          }else {
            this.getCategories(res.data.category)
            this.title = res.data.title
            this.description = res.data.description
            this.getPetitionImage()
            if (res.data.closingDate != null) {
              const closingDateObject = (new Date(res.data.closingDate))

              let closeDate = (closingDateObject.toLocaleDateString()).split("/")
              for (let i = 0 ; i < closeDate.length ; i++) {
                if (closeDate[i].length == 1) {
                  closeDate[i] = '0' + closeDate[i]
                }
              }

              this.date = closeDate[2] + "-" + closeDate[0] + "-" + closeDate[1]
              this.time = closingDateObject.getHours() + ":"  + closingDateObject.getMinutes() + ":00"
            }
            this.$v.$touch()
            this.ready = true

          }
        })
        .catch(err => this.$router.push('/'));

    },
    computed: {
      id: function() {
        this.$router.push('/login');
      }

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



