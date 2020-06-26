<template>
  <div>
    <NavBar v-bind:isLoggedIn="isLoggedIn" ></NavBar>
    <b-container>
      <b-carousel
        id="carousel-1"
        :interval="4000"
        background="#ababab"
        img-width="1200"
        img-height="180"
        style="text-shadow: 1px 1px 2px #333;"
      >
        <b-carousel-slide>
          <template v-slot:img>
            <b-img :src="image" alt="" width="1130" height="400"></b-img>
          </template>
        </b-carousel-slide>
      </b-carousel>
      <b-jumbotron :header= data.title header-level="5" :lead= lead>

        <p>{{data.category}}</p>
<!--        https://www.npmjs.com/package/vue-share-buttons-->
        <b-row>
          <b-col sm="2"></b-col>
          <b-col sm="8">

        <twitter-button
          class="share-button--circle share-button"
          btnText
          shareDescription="GitHub is where people build software."
          description="Look at this cool petition!! "
        />
        <reddit-button
          class="share-button"
          btn-text
          title="Look at this cool petition I made"
        ></reddit-button>
        <email-button
          class="share-button"
          btnText
          description="Look at this cool petition!!"
        />
        <pinterest-button
          btn-text
          description="Look at this cool petition!!"
        />

          </b-col>
          <b-col>
            <b-button-group v-if="data.authorId == signedInId && data != ''" >
              <b-button align="right" :to="'/edit/' + petitionId" v-if="closed != true">Edit</b-button>
              <b-button variant="danger" @click="removePetition()">Delete</b-button>
            </b-button-group>
<!--            <b-button v-if="checker()" align="right" :to="'/edit/' + petitionId">Edit</b-button>-->
            <b-button v-else-if="!signed && signed != null &&  signedInId != null && closed != true" variant="success" align="right" @click="signPetition(signed)">Sign</b-button>
            <b-button v-else-if="signed && (signed != null) && closed != true " variant="danger" align="right" @click="signPetition(signed)">Unsign</b-button>
            <b-button v-else-if="closed == true" variant="danger" align="right" pressed="true">Closed</b-button>

          </b-col>
        </b-row>

      </b-jumbotron>
      <div id = "info">
        <b-tabs content-class="mt-3" align="center">
          <b-tab title="Description" active><p align="left">{{data.description}}</p></b-tab>

          <b-tab title="Author" align="center">
            <b-card no-body class="overflow-hidden" style="max-width: 540px;">
              <b-row no-gutters>
                <b-col md="6">
                  <b-card-img :src="profileImage" alt="Image" class="rounded-0"></b-card-img>
                </b-col>
                <b-col md="6">
                  <b-card-body :title=data.authorName>
                    <div v-if="data.authorCity != null">
                      <b-card-text>
                        City: {{data.authorCity}}
                      </b-card-text>
                    </div>
                    <div v-if="data.authorCountry != null">
                      <b-card-text>
                        Country: {{data.authorCountry}}
                      </b-card-text>
                    </div>
                  </b-card-body>
                </b-col>
              </b-row>
            </b-card>
          </b-tab>


          <b-tab :title="data.signatureCount + ' Current Signatures'">
            <b-table
              ref="table"
              :fields="fields"
              :items="petition"
              id="petition111"
              :per-page="10"
              :current-page="currentPage"
            >
              <template v-slot:cell(name) = "data">
                <b-avatar :src="'http://45.76.124.20:4941/api/v1/users/' + data.item.signatoryId + '/photo' "></b-avatar>     {{data.item.name}}
<!--                <b-avatar :src="data.item.image"></b-avatar> {{ data.item.name }}-->
              </template>
            </b-table>
            <b-pagination
              v-model="currentPage"
              :total-rows="count"
              :per-page="10"
              aria-controls="petition"
            >
            </b-pagination>
          </b-tab>

        </b-tabs>
      </div>

    </b-container>
  </div>



</template>

<script>
  import NavBar from "./assets/NavBar";
  import TwitterButton from "vue-share-buttons/src/components/TwitterButton"
  import EmailButton from "vue-share-buttons/src/components/EmailButton"
  import RedditButton from "vue-share-buttons/src/components/RedditButton"
  import PinterestButton from "vue-share-buttons/src/components/PinterestButton"


  export default {
    components: {
      NavBar,
      TwitterButton,
      EmailButton,
      RedditButton,
      PinterestButton,

    },
    data() {
      return {
        petitionId:null,
        title:"",
        category:"",
        signatureCount:0,
        description:"",
        authorId:"",
        authorCity:"",
        authorCountry:"",
        createdDate:"",
        closingDate:"",
        data:"",
        image:"null",
        profileImage:null,
        fields: [
          { key: 'name', sortable: true },
          { key: 'city', sortable: false },
          { key: 'country', sortable: false },
        ],
        petition:null,
        currentPage:1,
        count:null,
        isLoggedIn:true,
        lead:"",
        signed : null,
        signedInId: localStorage.getItem('user'),
        closed:null,
        createdDateObject:null,
        closingDateObject:null,


      }
    },
    methods: {
      checkClosed() {
        let now = new Date()
        if (now > this.closingDateObject) {
          return true
        }
        return false
      },
      removePetition() {
        const currentObj = this
        this.axios.delete('http://45.76.124.20:4941/api/v1/petitions/' + this.petitionId )
          .then((res) => {
            this.$router.push('/profile')
          })
          .catch(err => alert(err));
      },
      signPetition(signed) {
        if (!signed) {
          this.axios.post('http://45.76.124.20:4941/api/v1/petitions/' + this.petitionId + "/signatures" )
            .then((res) => {
              this.signed = true
              this.getPetitions()
            })
            .catch(err => alert(err));

        }else {
        this.axios.delete('http://45.76.124.20:4941/api/v1/petitions/' + this.petitionId + "/signatures" )
          .then((res) => {
            this.signed = false
            this.getPetitions()
          })
          .catch(err => alert(err));
        }
        window.location.reload()
      },
      getPageRange() {
        let highEnd = this.currentPage * 10
        this.final = false
        if (highEnd >= this.count){
          this.final = true
          highEnd = this.count
        }
        const lowEnd = this.count != 0 ? (this.currentPage * 10) -9 : 0

        this.pageRange = lowEnd.toString() + " - " + highEnd.toString()
      },
      getPetitions() {
        this.petitionId = this.$route.params.id;
        const currentObj = this
        this.axios.get('http://45.76.124.20:4941/api/v1/petitions/' + this.petitionId )
          .then((res) => {
            this.data = res.data;
            this.getProfileImage();
            this.createdDateObject = (new Date(res.data.createdDate))
            this.closingDateObject = (new Date(res.data.closingDate))

            this.createdDate = this.createdDateObject.toLocaleDateString('en-nz')
            this.closingDate = this.closingDateObject.toLocaleDateString('en-nz') + " " + this.closingDateObject.toLocaleTimeString('en-nz');
            this.lead = "Created:  "+ this.createdDate
            if (res.data.closingDate != null && this.checkClosed()){
              this.closed = true
              this.lead += " Closed: " + this.closingDate
            }
            this.lead += res.data.closingDate != null && !this.checkClosed() ? " Closing: " + this.closingDate : ""

          })
          .catch(err => alert(err));
      },
      getSignatures() {
        const currentObj = this;
        this.axios.get('http://45.76.124.20:4941/api/v1/petitions/' + this.petitionId + "/signatures")
          .then((res) => {
            this.petition = res.data;
            this.count = res.data.length
            for (let i = 0; i < this.petition.length; i++) {
              if(this.petition[i].signatoryId == localStorage.getItem("user")){
                this.signed = true
              }
            }
            if (this.signed == null) {
              this.signed = false
            }

          })
          .catch(err => alert(err));
      },
      getImage() {
        const currentObj = this
        this.axios.get('http://45.76.124.20:4941/api/v1/petitions/' + this.petitionId + "/photo", { responseType: 'blob' })
          .then((res) => {
            let fileReader = new FileReader();
            fileReader.readAsDataURL(res.data);
            fileReader.onload = () => {
              currentObj.image = fileReader.result;
            }

          })
          .catch(err => console.log(err));
      },
      getProfileImage() {
        const currentObj = this
        this.axios.get('http://45.76.124.20:4941/api/v1/users/' + this.data.authorId + "/photo", { responseType: 'blob' })
          .then((res) => {
            let fileReader = new FileReader();
            fileReader.readAsDataURL(res.data);
            fileReader.onload = () => {
              currentObj.profileImage = fileReader.result;
            }
          })
          .catch(err => currentObj.profileImage = "https://www.signtech.co.nz/wp-content/uploads/2019/08/facebook-blank-face-blank.jpg" );
      },

      onSubmit() {
        alert("hi");
      }

    },
    mounted: function () {
      this.getPetitions();
      this.getImage()
      this.getSignatures()
      this.axios.defaults.headers.common['X-Authorization'] = localStorage.getItem('token');
    }
  }
</script>

<style scoped>
  #info{
    margin-bottom: 200px;
  }

</style>
