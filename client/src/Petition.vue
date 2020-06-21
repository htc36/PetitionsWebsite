<template>
  <div>
    <NavBar></NavBar>
    <b-container>
      <petitions-list></petitions-list>
    </b-container>
  </div>



</template>

<script>
  import NavBar from "./assets/NavBar";
  import PetitionsList from "./assets/PetitionsList";

  export default {
    components: {
      NavBar,
      PetitionsList
    },
    data() {
      return {
        authorId:'',
        categoryId: '',
        title:'',
      }
    },
  }
</script>

<style scoped>

</style>
