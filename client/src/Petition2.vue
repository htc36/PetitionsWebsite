<template>
  <div>
    <NavBar v-bind:isLoggedIn="isLoggedIn" ></NavBar>
    <b-table
      :fields="fields"
      :items="petition"
      id="petitions"
    >
      <template v-slot:cell(view)="data">
        <a :href="'/petitions/' + data.item.petitionId">View</a>
      </template>
    </b-table>
    <b-pagination
      v-model="currentPage"
      :total-rows="count"
      :per-page="limit"
      @input="getPetitions(currentPage)"
    >
    </b-pagination>
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
        currentPage: 1,
        count: null,
        limit:10,
        petition: [],
        fields: [
          { key: 'petitionId', sortable: true },
          { key: 'title', sortable: true },
          { key: 'category', sortable: true },
          { key: 'authorName', sortable: true },
          { key: 'signatureCount', sortable: true },
          { key: 'view', sortable: false }
        ],


        emailErrMsg: "Invalid Email"
      }
    },
    methods: {
      getPetitions(page) {
        // this.axios.get('http://localhost:4941/api/v1/petitions')
        const startIndex = (page - 1) * this.limit
        this.axios.get('http://csse-s365.canterbury.ac.nz:4001/api/v1/petitions?startIndex='+ startIndex + '&count=' + this.limit)
          .then((res) => {
            this.petition = res.data;
          })
          .catch(err => alert(err));
      },
      getPetitionsCount() {

        this.axios.get('http://csse-s365.canterbury.ac.nz:4001/api/v1/petitions')
          .then((res) => {
            this.count = res.data.length;
          })
          .catch(err => alert(err));
      },

    },
    mounted: function () {
      this.getPetitions(1);
      this.getPetitionsCount()

    }
  }
</script>

<style scoped>

</style>
