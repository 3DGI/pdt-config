<template>
  <div id="RecordList" class="row">
        <div id="filter-panel" :class="'col-2 '">
          <h3>Search query</h3>
          <form>
            <div class="input-group mb-3">
              <div class="input-group mb-3">
                <input v-model="filter_anytext" type="text" class="form-control" placeholder="Search terms" aria-label="Search terms" aria-describedby="basic-addon2">
                <button class="btn btn-secondary btn-labeled" type="button" id="button-addon2" v-on:click="fetch_records()">
                  <span class="btn-label">
                    <i class="bi-search" role="img" aria-label="search"></i>
                  </span>Search
                </button>
              </div>
              
              <!-- <div class="input-group-append">
                <button v-on:click="filter_anytext=''" class="btn btn-outline-secondary" type="button">Clear</button>
              </div> -->
            </div>
            <div v-if="!loading_records">
              <p class="text-black-50">
                <i class="bi-diagram-2" role="img" aria-label="classification"></i> {{ loading_records ? 0 : this.data_records.classifications.length}} Classifications 
                <br />
                <i class="bi-card-heading" role="img" aria-label="property"></i> {{ loading_records ? 0 : this.data_records.properties.length }} Properties
               </p>
              <div class="form-group">
                <label style="font-weight:600"><i class="bi-funnel" role="img" aria-label="funnel"></i> Filter by domain</label>
                <!-- <div class="btn-group btn-group-toggle" data-toggle="buttons">
                  <label class="btn-sm btn btn-secondary active">
                    <input type="radio" name="options" id="option1" autocomplete="off" checked> OR
                  </label>
                  <label class="btn-sm btn btn-secondary">
                    <input type="radio" name="options" id="option3" autocomplete="off"> AND
                  </label>
                </div> -->
                <div>
                  <div v-for="dom in data_records['domains']" :key="dom.namespaceUri" class="form-check">
                    <input v-model="filter_domains" class="form-check-input" type="checkbox" :value="dom.namespaceUri" :id="get_domain_version_name(dom)">
                    <label class="form-check-label" :for="get_domain_version_name(dom)">
                      {{get_domain_version_name(dom)}}
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <!-- <router-link :to="get_filter_url()" class="btn btn-primary" >Search</router-link> -->
            <!-- <router-link to="/" class="btn btn-primary" >R</router-link> -->
          </form>
        </div>
        <div id="record-list-panel" :class="'col '+ loading_records">

          <h3>Search results</h3>

          <ul class="nav nav-tabs">
            <li class="nav-item">
              <input type="radio" class="btn-check" name="options" id="list_classifications" value="list_classifications" v-model="list_filter" autocomplete="off">
              <label class="btn nav-link" :class="{active: list_filter == 'list_classifications'}" for="list_classifications">Classifications</label>
            </li>
            <li class="nav-item">
              <input type="radio" class="btn-check" name="options" id="list_properties" value="list_properties" v-model="list_filter" autocomplete="off">
              <label class="btn nav-link" :class="{active: list_filter == 'list_properties'}" for="list_properties">Properties</label>
            </li>
          </ul>
          

          <div v-if="!loading_records && (list_filter=='list_classifications' || list_filter=='list_all')">
            <div class="table-responsive">
              <table class="table table-hover align-middle">
                <thead>
                  <tr>
                    <th scope="col"></th>
                    <th scope="col">Domain</th>
                    <th scope="col">Parent classification and name</th>
                    <th scope="col"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in filter_by_domain(data_records['classifications'])" :key="item.namespaceUri">
                    <td><i class="bi-diagram-2" role="img" aria-label="classification"></i></td>
                    <td>{{item.domainName}}</td>
                    <td><span class="text-black-50">{{item.parentClassificationName}} ></span> <br /> {{item.name}}</td>
                    <td>
                      <button class="btn btn-primary btn-sm btn-labeled" type="button" id="button-addon2" v-on:click="addClassificationToBasket(item)">
                        <span class="btn-label">
                          <i class="bi-plus-circle" role="img" aria-label="add"></i>
                        </span>Add properties to PDT
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div v-if="!loading_records && (list_filter=='list_properties' || list_filter=='list_all')">
            <div class="table-responsive">
              <table class="table table-hover align-middle">
                <thead>
                  <tr>
                    <th scope="col"></th>
                    <th scope="col">Domain</th>
                    <th scope="col">Name</th>
                    <th scope="col"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in filter_by_domain(data_records['properties'])" :key="item.namespaceUri">
                    <td><i class="bi-card-heading" role="img" aria-label="propterty"></i></td>
                    <td>{{item.domainName}}</td>
                    <td>{{item.name}}</td>
                    <td>
                      <button class="btn btn-primary btn-sm btn-labeled" type="button" id="button-addon2" v-on:click="addPropertyToBasket(item.namespaceUri)">
                        <span class="btn-label">
                          <i class="bi-plus-circle" role="img" aria-label="add"></i>
                        </span>Add to PDT
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div id="pdt-panel" :class="'col'">

          <h3>Product Data Template</h3>

          <div class="btn-group" role="group" aria-label="PDT buttons">
            <button type="button" class="btn btn-primary btn-labeled" v-on:click="addCustomPropModal.toggle()">
              <span class="btn-label">
                <i class="bi-plus-circle" role="img" aria-label="plus"></i>
              </span>Add custom property
            </button>
            <button type="button" class="btn btn-primary btn-labeled" v-on:click="XMLExportModal.toggle()">
              <span class="btn-label">
                <i class="bi-save" role="img" aria-label="save"></i>
              </span>Export
            </button>
            <button type="button" class="btn btn-danger btn-labeled" v-on:click="clearPDT()">
              <span class="btn-label">
                <i class="bi-trash" role="img" aria-label="trash"></i>
              </span>Clear PDT
            </button>
          </div>

          <h5 style="margin: 2em 0 1em 0">Properties in PDT ({{Object.keys(basket).length}})</h5>

          <div class="table-responsive">
            <table class="table align-middle">
              <thead>
                <tr>
                  <th scope="col"></th>
                  <th scope="col">Name</th>
                  <th scope="col"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="Object.keys(basket).length === 0">
                  <td colspan="4" class="text-center">No properties added</td>
                </tr>
                <tr v-for="(item, index) in basket" :key="item.namespaceUri">
                  <td><i class="bi-card-heading" role="img" aria-label="propterty"></i></td>
                  <td>{{item.name}}</td>
                  <td>
                    <div class="btn-group" role="group" aria-label="Property actions">
                      <button class="btn btn-primary btn-sm" type="button" id="button-addon2" v-on:click="inspectPropNS=item.namespaceUri; inspectPropModal.toggle()">

                          <i class="bi-info-square-fill" role="img" aria-label="info"></i>

                      </button>
                      <button class="btn btn-danger btn-sm" type="button" id="button-addon2" v-on:click="removePropertyFromBasket(index)">

                          <i class="bi-trash-fill" role="img" aria-label="remove"></i>

                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="fetchting_basket_items">
                  <td colspan="4" class="text-center text-black-50">
                    <div class="spinner-border spinner-border-sm" role="status">
                      <span class="visually-hidden">Loading...</span>
                    </div> retrieving properties
                  </td>
                </tr>
              </tbody>
            </table>
          </div>


          <!-- Modal inspect Property -->
          <div class="modal fade" id="inspectPropModal" tabindex="-1" aria-labelledby="inspectPropModalLabel" aria-hidden="true">
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title" id="inspectPropModalLabel">Property attributes</h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                  <div class="table-responsive">
                    <table class="table align-middle table-borderless">
                      <tbody>
                        <tr v-for="(item, index) in basket[inspectPropNS]" :key="index">
                          <td class="fw-bold">{{index}}</td>
                          <td>{{item}}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- Modal Create Property -->
          <div class="modal fade" id="addCustomPropModal" tabindex="-1" aria-labelledby="addCustomPropModalLabel" aria-hidden="true">
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title" id="addCustomPropModalLabel">Add Custom PDT property</h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                  <div class="form-floating mb-3">
                    <input class="form-control" id="customPropName" placeholder="MyProperty" v-model="customPropName">
                    <label for="customPropName">Property name</label>
                  </div>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                  <button type="button" class="btn btn-primary" v-on:click="addCustomProp()">Add to PDT</button>
                </div>
              </div>
            </div>
          </div>
          <!-- Modal Export -->
          <div class="modal fade" id="XMLExportModal" tabindex="-1" aria-labelledby="XMLExportModalLabel" aria-hidden="true">
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title" id="XMLExportModalLabel">Export to XML</h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                  <div class="form-floating mb-3">
                    <input class="form-control" id="pdtName" placeholder="MyPDT" v-model="pdtName">
                    <label for="pdtName">PDT Name</label>
                  </div>
                </div>
                <div class="modal-footer">
                  <button class="btn btn-primary" v-on:click="downloadGenericXML('pdt.xml')">Download generic XML</button>
                  <button class="btn btn-primary" v-on:click="downloadIDS('pdt.xml')">Download IDS</button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
</template>

<script>
// import 'vue-octicon/icons'
import * as util from '../util.js'
import { Modal } from 'bootstrap';
// import { BIconBatteryFull, BIconArrow90degDown, BIconBookmark } from 'bootstrap-icons-vue';
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
        fetchting_basket_items:false,
        list_filter: "list_properties",
        XMLGenericExport: "",
        IDSExport: "",
        pdtName: "",
        customPropName: "",
        inspectPropNS: null
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
        downloadGenericXML(filename) {
          this.exportGenericXML();
          this.downloadXML(filename, this.XMLGenericExport)
        },
        downloadIDS(filename) {
          this.exportIDS();
          this.downloadXML(filename, this.IDSExport)
        },
        downloadXML: function(fileName, contents) {
          
          var blob = new Blob([contents], { type: 'xml' });

          var a = document.createElement('a');
          a.download = fileName;
          a.href = URL.createObjectURL(blob);
          a.dataset.downloadurl = ['xml', a.download, a.href].join(':');
          a.style.display = "none";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(function() { URL.revokeObjectURL(a.href); }, 1500);
        },
        addCustomProp: function() {
          this.$set(this.basket, this.customPropName, {'name': this.customPropName});
          this.customPropName = "";
          this.addCustomPropModal.toggle();
        },
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
        exportGenericXML: function( ) {
          const root = xmlbuilder.create({ version: '1.0' })
          .ele('ProductDataTemplate', {'name': this.pdtName})

            for (const item of Object.values(this.basket)) {
              root.ele({Property: item}).up();
            }
          root.up()
          this.XMLGenericExport = root.end({ prettyPrint: true });
        },
        exportIDS: function( ) {
          // build the xml
          var xs = 'http://www.w3.org/2001/XMLSchema';
          var xsi = 'http://www.w3.org/2001/XMLSchema-instance';
          var xmlns = "http://www.w3.org/2000/xmlns/";
          var ids = "http://standards.buildingsmart.org/IDS";

          var idsType = document.implementation.createDocument(ids, "ids");
          idsType.documentElement.setAttributeNS(xmlns, 'xmlns:ids', ids);
          idsType.documentElement.setAttributeNS(xmlns, 'xmlns:xs', xs);
          idsType.documentElement.setAttributeNS(xmlns, 'xmlns:xsi', xsi);
          idsType.documentElement.setAttributeNS(xsi, 'xsi:schemaLocation', ids+" ids_04.xsd");

          // ids:info
          var ids_info = idsType.createElementNS(ids, "ids:info");
          var ids_title = idsType.createElementNS(ids, "ids:title");
          ids_title.appendChild(document.createTextNode(this.pdtName));
          ids_info.appendChild(ids_title);
          var ids_date = idsType.createElementNS(ids, "ids:date");
          ids_info.appendChild(ids_date);
          var ids_copyright = idsType.createElementNS(ids, "ids:copyright");
          ids_info.appendChild(ids_copyright);
          idsType.documentElement.appendChild(ids_info);

          // ids:specification, there can be many
          var ids_specification = idsType.createElementNS(ids, "ids:specification");
          
          var ids_applicability = idsType.createElementNS(ids, "ids:applicability");
          
          var ids_requirements = idsType.createElementNS(ids, "ids:requirements");
          for (const item of Object.values(this.basket)) {
            var ids_property = idsType.createElementNS(ids, "ids:property");
            ids_property.setAttribute("location", "any");
            ids_property.setAttribute("uri", item.namespaceUri);
            
            var ids_name = idsType.createElementNS(ids, "ids:name");
            var ids_simpleValue = idsType.createElementNS(ids, "ids:simpleValue");
            ids_simpleValue.appendChild(document.createTextNode(item.name));
            ids_name.appendChild(ids_simpleValue);
            ids_property.appendChild(ids_name);

            var ids_propertyset = idsType.createElementNS(ids, "ids:propertyset");
            ids_property.appendChild(ids_propertyset);

            if ("description" in item) {
              var ids_instructions = idsType.createElementNS(ids, "ids:instructions");
              ids_instructions.appendChild(document.createTextNode(item.description));
              ids_property.appendChild(ids_instructions);
            }

            var ids_value = idsType.createElementNS(ids, "ids:value");
            var xs_restriction = idsType.createElementNS(xs, "xs:restriction");
            if (item.dataType == "String") {
              xs_restriction.setAttribute("base", "xs:string");
            } else if (item.dataType == "Boolean") {
              xs_restriction.setAttribute("base", "xs:boolean");
            } else if (item.dataType == "Integer") {
              xs_restriction.setAttribute("base", "xs:integer");
            } else if (item.dataType == "Real") {
              xs_restriction.setAttribute("base", "xs:float");
            }
            ids_value.appendChild(xs_restriction);
            ids_property.appendChild(ids_value);
            
            ids_requirements.appendChild(ids_property);
          }
          

          ids_specification.appendChild(ids_applicability);
          ids_specification.appendChild(ids_requirements);
          
          idsType.documentElement.appendChild(ids_specification);
                    
          this.IDSExport = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" + new XMLSerializer().serializeToString(idsType);
        },
        removePropertyFromBasket: function ( index ) {
          this.$delete(this.basket, index)
        },
        addPropertyToBasket: function ( namespaceUri ) {
          // fetch full data
          this.fetchting_basket_items = true;
          fetch(util.PropertyUrl + "?namespaceUri=" + namespaceUri)
          .then(response => response.json())
          .then(data => {
            console.log(data);
            this.$set(this.basket, data.namespaceUri, data)
            this.fetchting_basket_items = false;
          })
          .catch(error => {
            console.error('Error:', error);
            this.fetchting_basket_items = false;
          });
        },
        addClassificationToBasket: function ( item ) {
          // fetch full data
          this.fetchting_basket_items = true;
          fetch(util.ClassificationUrl + "?namespaceUri=" + item.namespaceUri)
          .then(response => response.json())
          .then(data => {
            console.log(data);
            // this.$set(this.basket, data.namespaceUri, data)
            for (const prop of data.classificationProperties) {
              this.addPropertyToBasket(prop.propertyNamespaceUri);
            }
            this.fetchting_basket_items = false;
          })
          .catch(error => {
            console.error('Error:', error);
            this.fetchting_basket_items = false;
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
    mounted(){
        // console.log(this.$route.query),
        // this.set_data_from_route(),
        // this.fetch_records(),
        // this.fetch_domain_data()
        this.addCustomPropModal = new Modal(document.getElementById('addCustomPropModal'), {
          keyboard: false
        });
        this.inspectPropModal = new Modal(document.getElementById('inspectPropModal'), {
          keyboard: false
        });
        this.XMLExportModal = new Modal(document.getElementById('XMLExportModal'), {
          keyboard: false
        });
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

.btn-label {
	position: relative;
	left: -12px;
	display: inline-block;
	padding: 6px 12px;
	background: rgba(0, 0, 0, 0.07);
	border-radius: 3px 0 0 3px;
}

.btn-labeled {
	padding-top: 0;
	padding-bottom: 0;
}

</style>
