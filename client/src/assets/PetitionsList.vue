<template>
  <div>
    <div v-if="!onProfilePage">
    <b-row>
      <b-col sm="7">
        <h6 align="left">Title Search</h6>
      </b-col>
      <b-col sm="3">
        <h6 align="left">Category</h6>
      </b-col>
    </b-row>

    <b-form @submit.prevent="getPetitions" class="needs-validation">
      <b-row>
        <b-col sm="7">
          <b-form-input v-model="title" placeholder="Enter title"></b-form-input>
          <br>
        </b-col>
        <b-col sm="3">
          <b-form-select :options="options" v-model ="categoryId" ></b-form-select>
          <br>
        </b-col>
        <b-col sm="2">
          <b-button-group>
            <b-button variant="danger" @click="clearFields()">Clear</b-button>
            <b-button type=submit variant="primary">Search</b-button>
          </b-button-group>

          <br>
        </b-col>
      </b-row>
    </b-form>
    </div>

    <b-row>
    <b-table
      :fields="fields"
      :items="petition"
      id="petition"
      :per-page="limit"
      :current-page="currentPage"
      :sort-by.sync="sort"
      :sort-desc.sync="sortDesc"
    >
      <template v-slot:cell(view)="data">
        <a :href="'#/petition/' + data.item.petitionId">View</a>
      </template>
      <template v-slot:cell(image) = "data">
        <img :src="'http://45.76.124.20:4941/api/v1/petitions/' + data.item.petitionId + '/photo' " alt="" width="50" heigt="50"/>
      </template>
    </b-table>
    </b-row>
    <b-row>
      <b-col sm="7">
        <b-pagination
          v-model="currentPage"
          :total-rows="count"
          :per-page="limit"
          aria-controls="petition"
          @input="getPageRange"
        >
        </b-pagination>
      </b-col>
      <b-col>
        <div v-if="final">
          <h6 align="right">Final page</h6>
        </div>
      </b-col>
      <b-col sm="2">
        <h6 align="right">{{pageRange}}</h6>
      </b-col>
    </b-row>
  </div>


</template>

<script>
  export default {
    components: {
    },
    data() {
      return {
        fields: [
          { key: 'title', sortable: true },
          { key: 'authorName', sortable: false },
          { key: 'category', sortable: false },
          { key: 'signatureCount', sortable: true },
          { key: 'image', sortable: false },
          { key: 'view', sortable: false }
        ],
        sort:"signatureCount",
        sortDesc:"true",
        currentPage: 1,
        count: null,
        limit:10,
        petition: [],
        emailErrMsg: "Invalid Email",
        authorId:'',
        categoryId: '',
        title:'',
        pageRange:null,
        final:false,
        options:[]
      }
    },
    props: {
      onProfilePage: {
        type: Boolean,
        default: false,
      },
    },
      methods: {
        clearFields() {
          this.title = ''
          this.categoryId = ''
          this.getPetitions()
        },
        getCategories() {
          const currectObj = this;
          this.axios.get('http://45.76.124.20:4941/api/v1/petitions/categories')
            .then((res) => {
              const data = res.data;
              for (let i = 0; i < data.length; i++) {
                currectObj.options.push({value: data[i].categoryId, text: data[i].name})
              }
            })
            .catch(err => alert(err));
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
        let hit = false
        let query = ""
        if(this.title != '') {
          query += "?q=" + this.title
          hit = true
        }
        if(this.categoryId != ''){
          query += hit ? '&' : '?';
          query += "categoryId=" + this.categoryId
          hit =true
        }
        if(this.authorId != ''){
          query += hit ? '&' : '?';
          query += "authorId=" + this.authorId
        }
        let getUrl = 'http://45.76.124.20:4941/api/v1/petitions' + query
        if (this.onProfilePage) {
          getUrl = 'http://45.76.124.20:4941/api/v1/petitions?authorId=' + localStorage.getItem("user")
        }
        this.axios.get(getUrl)
          .then((res) => {
            this.petition = res.data;
            this.count = res.data.length;
            this.getPageRange()
          })
          .catch(err => alert(err));
      },
    },
    mounted: function () {
      this.getPetitions();
      this.getCategories()

    }
  }

</script>

<style scoped>

</style>
