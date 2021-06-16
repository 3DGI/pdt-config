<template>
  <div id="RecordList" class="row">
        <div id="filter-panel" :class="'col-2 '">
          <h4>Search query <router-link tag="a" to="/" class="badge badge-link">[reset]</router-link></h4> 
          <form>
            <div class="input-group mb-3">
              <div class="input-group mb-3">
                <input v-model="filter_anytext" type="text" class="form-control" placeholder="Search terms" aria-label="Search terms" aria-describedby="basic-addon2">
                <button class="btn btn-outline-secondary" type="button" id="button-addon2" v-on:click="fetch_records()">Search</button>
              </div>
              
              <!-- <div class="input-group-append">
                <button v-on:click="filter_anytext=''" class="btn btn-outline-secondary" type="button">Clear</button>
              </div> -->
            </div>
            <div  class="form-group">
              <label>Domains</label>
              <!-- <div class="btn-group btn-group-toggle" data-toggle="buttons">
                <label class="btn-sm btn btn-secondary active">
                  <input type="radio" name="options" id="option1" autocomplete="off" checked> OR
                </label>
                <label class="btn-sm btn btn-secondary">
                  <input type="radio" name="options" id="option3" autocomplete="off"> AND
                </label>
              </div> -->
              <div v-if="!loading_records">
                <div v-for="dom in data_records['domains']" :key="dom.namespaceUri" class="form-check">
                  <input v-model="filter_domains" class="form-check-input" type="checkbox" :value="dom.namespaceUri" :id="get_domain_version_name(dom)">
                  <label class="form-check-label" :for="get_domain_version_name(dom)">
                    {{get_domain_version_name(dom)}}
                  </label>
                </div>
              </div>
            </div>
            <!-- <router-link :to="get_filter_url()" class="btn btn-primary" >Search</router-link> -->
            <!-- <router-link to="/" class="btn btn-primary" >R</router-link> -->
          </form>
        </div>
        <div id="record-list-panel" :class="'col '+ loading_records">

          <h4>Search results</h4>

          <input type="radio" class="btn-check" name="options" id="list_all" value="list_all" v-model="list_filter"  autocomplete="off">
          <label class="btn btn-secondary" for="list_all">All ({{ loading_records ? 0 : this.data_records.classifications.length + this.data_records.properties.length }})</label>

          <input type="radio" class="btn-check" name="options" id="list_classifications" value="list_classifications" v-model="list_filter" autocomplete="off">
          <label class="btn btn-secondary" for="list_classifications">Classifications ({{ loading_records ? 0 : this.data_records.classifications.length}})</label>

          <input type="radio" class="btn-check" name="options" id="list_properties" value="list_properties" v-model="list_filter" autocomplete="off">
          <label class="btn btn-secondary" for="list_properties">Properties ({{ loading_records ? 0 : this.data_records.properties.length }})</label>

          <div v-if="!loading_records && (list_filter=='list_classifications' || list_filter=='list_all')">
            <div v-for="item in filter_by_domain(data_records['classifications'])" :key="item.namespaceUri" class="card mb-3" style="">
            
              <div class="card-body">
                <p class="card-text mt-2">Classification {{item.domainName}} > .. > {{item.parentClassificationName}}</p>
                <h5 class="card-title mb-0">{{item.name}}</h5>
                
                <button class="btn btn-primary" v-on:click="addClassificationToBasket(item)">Add all properties to PDT</button>
              </div>
            </div>
          </div>
          <div v-if="!loading_records && (list_filter=='list_properties' || list_filter=='list_all')">
            <div v-for="item in filter_by_domain(data_records['properties'])" :key="item.namespaceUri" class="card mb-3" style="">
            
              <div class="card-body">
                <p class="card-text mt-2">Property {{item.domainName}}</p>
                <h5 class="card-title mb-0">{{item.name}}</h5>
                
                <button class="btn btn-primary" v-on:click="addPropertyToBasket(item.namespaceUri)">Add to PDT</button>
              </div>
            </div>
          </div>
        </div>
        <div id="pdt-panel" :class="'col'">

          <h4>Product Data Template</h4>

          <button class="btn btn-primary" v-on:click="clearPDT()">Clear PDT</button>

          <br />

          <div v-for="(item, index) in basket" :key="item.namespaceUri" class="card mb-3" style="">
            
            <div class="card-body">
              <p class="card-text mt-2">Property {{item.domainName}}</p>
              <h5 class="card-title mb-0">{{item.name}}</h5>
              <button class="btn btn-danger" v-on:click="removePropertyFromBasket(index)">Remove</button>
            </div>
          </div>

          <button class="btn btn-primary" v-on:click="exportXML">Export to XML</button>
          <textarea class="h-25 form-control" v-model="exportedXML" placeholder="XML..."></textarea>


        </div>
      </div>
</template>

<script>
// import 'vue-octicon/icons'
import * as util from '../util.js'
const xmlbuilder = require('xmlbuilder2');

export default {
  data: function() { return {
        data_records: null,
        basket: {},
        search_timeout: null,
        filter_anytext: 'wand',
        filter_domains: [],
        fetching_records:true,
        fetching_domain_data:true,
        list_filter: "list_properties",
        exportedXML: ""
        }
    },
    computed: {
        loading_records: function(){
            return this.fetching_records?'loading':'';
        },
        loading_filter: function(){
            return this.fetching_domain_data?'loading':'';
        },
        size_all: function() {
          console.log(this.data_records);
          if (!this.fetching_records)
            return this.data_records.classifications.length + this.data_records.properties.length;
          else
            return 0;
        }
    },
    watch: {
        filter_anytext: function(){
            // clearTimeout(this.search_timeout);
            // this.search_timeout = setTimeout(this.fetch_records, 400);
            // this.push_filter_url();
        },
        // $route: function(){
        //     if(this.$route.query)
        //         this.set_data_from_route();
        //     else
        //         this.reset_data()
        //     this.fetch_records();
        // }
    },
    methods: {
        clearPDT: function() {
          this.basket = {};
        },
        filter_by_domain: function(items) {
          if (this.filter_domains.length) {
            let that = this;
            return items.filter(function (item) {
              return that.filter_domains.includes(item.domainNamespaceUri);
            })
          } else {
            return items;
          }
        },
        get_domain_version_name: function (domain) {
          let version = domain.namespaceUri.split("-").pop();
          if(!isNaN(version))
            return domain.name + " " + version;
          else
            return domain.name;
        },
        exportXML: function( ) {
          const root = xmlbuilder.create({ version: '1.0' })
          .ele('ProductDataTemplate')

            for (const item of Object.values(this.basket)) {
              root.ele({Property: item}).up();
            }
          root.up()
          this.exportedXML = root.end({ prettyPrint: true });
        },
        removePropertyFromBasket: function ( index ) {
          this.$delete(this.basket, index)
        },
        addPropertyToBasket: function ( namespaceUri ) {
          // fetch full data
          fetch(util.PropertyUrl + "?namespaceUri=" + namespaceUri)
          .then(response => response.json())
          .then(data => {
            console.log(data);
            this.$set(this.basket, data.namespaceUri, data)
          })
          .catch(error => {
            console.error('Error:', error);
          });
        },
        addClassificationToBasket: function ( item ) {
          // fetch full data
          fetch(util.ClassificationUrl + "?namespaceUri=" + item.namespaceUri)
          .then(response => response.json())
          .then(data => {
            console.log(data);
            // this.$set(this.basket, data.namespaceUri, data)
            for (const prop of data.classificationProperties) {
              this.addPropertyToBasket(prop.propertyNamespaceUri);
            }
          })
          .catch(error => {
            console.error('Error:', error);
          });
        },
        fetch_records: function() {

            let that = this;
            this.fetching_records=true;
            that.data_records=null;
            fetch(util.TextSearchListOpenUrl + "?SearchText=" + this.filter_anytext)
            .then(response => response.json())
            .then(data => {
              console.log(data);
              that.data_records = data;
              that.fetching_records=false;
            })
            .catch(error => {
              console.error('Error:', error);
            });
        },
        denounced_fetch: function(){
            clearTimeout(this.search_timeout);
            this.search_timeout = setTimeout(this.fetch_records, 500);
        }, 
        fetch_domain_data: function() {
        }
    },
    beforeMount(){
        // console.log(this.$route.query),
        // this.set_data_from_route(),
        // this.fetch_records(),
        // this.fetch_domain_data()
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#record-list-panel, #filter-panel {
    opacity: 1.0;
    transition: opacity 0.2s;
}
#record-list-panel.loading, #filter-panel.loading {
    opacity: 0.1;
}
</style>
