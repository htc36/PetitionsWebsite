<template>
  <div id = "navArea">
    <b-navbar toggleable="lg" type="dark" variant="info">
      <b-navbar-brand href="/">Petitify</b-navbar-brand>

      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav v-if="loggedIn">
          <b-nav-item href="/create">Create</b-nav-item>
          <b-nav-item href="/profile">Profile</b-nav-item>
        </b-navbar-nav>

        <!-- Right aligned nav items -->
        <b-navbar-nav class="ml-auto">
          <b-nav-item v-if="loggedIn" href="/editProfile">Edit Profile</b-nav-item>
          <b-navbar-nav>
            <b-nav-item v-if="!this.loggedIn" to='/login'>Log In</b-nav-item>
            <b-nav-item v-if="this.loggedIn" @click="logout" >Log Out</b-nav-item>
          </b-navbar-nav>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
  </div>
</template>

<script>
  import 'bootstrap/dist/css/bootstrap.css'
  import 'bootstrap-vue/dist/bootstrap-vue.css'

  const NavBar = {
    name: 'NavBar',
    components: {},
    data: function () {
      return {
        loggedIn: "",
        name: ""
      }
    },
    watch: {
      isLoggedIn: function (newVal, oldVal) {
        console.log('IsLoggedIn prop changed' + newVal + ' ' + oldVal)
      }
    },
    methods: {
      logout() {
        const vueObj = this;
        this.axios.defaults.headers.common['X-Authorization'] = localStorage.getItem('token');
        this.axios.post('http://localhost:4941/api/v1/users/logout')
          .then(function (response) {
            localStorage.clear();
            vueObj.$router.push('/login');
          })
          .catch(function (error) {

          });
    },
      goToEdit() {
        const profileId = this.$route.params.id;
        this.$router.push('/profile/edit/' + profileId);
      },
      goToProfile() {
        const profileId = this.$route.params.id;
        this.$router.push('/profile/' + profileId);
      }
    },
    mounted: function() {
      this.loggedIn = localStorage.getItem('token') != null
    }
  };
  export default NavBar
</script>

<style scoped>
    [v-cloak] {
        display: none;
    }

    .searchbtn {
        margin-right: 10px;
    }
    #navArea{
      margin-bottom: 30px;

    }

</style>
