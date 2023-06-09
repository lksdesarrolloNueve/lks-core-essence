/*import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { GestionGenericaService } from "../../../../shared/service/gestion";



@Component({
    selector: 'admin-mapa',
    moduleId: module.id,
    templateUrl: 'admin-mapa.component.html'
})
*/
/**
 * @autor: Eduardo Romero Haro
 * @version: 1.0.0
 * @fecha: Octubre-2021
 * @descripcion: Componente para la gestión del mapa
 */

/*
export class AdminMapaComponent implements OnInit {
    //Declaracion de variables
    titulo: string;
    accion: number;
    avisoID: number=0;
    @BlockUI() blockUI: NgBlockUI;
    listaTipoAvisos : any;
    clasificacionControl     = new FormControl('',[Validators.required])
    formMapa : FormGroup;
    vLongitudMarket:  any;
    vLatitudMarket:  any;

    //Constructor para formular las validaciones.
    constructor(private service: GestionGenericaService,
        private formBuilder: FormBuilder,
         @Inject(MAT_DIALOG_DATA) public data: any){
        
        this.titulo = ' Mapa';
        this.accion= data.accion;
        this.formMapa = this.formBuilder.group({
           
        });
    }
    center: google.maps.LatLngLiteral = {lat: 21.159556, lng: -100.932345};
    zoom = 4;
    markerOptions: google.maps.MarkerOptions = {draggable: true};
    markerPositions: google.maps.LatLngLiteral[] = [];
   
    addMarker(event: google.maps.MapMouseEvent) {
      this.markerPositions.push(event.latLng.toJSON());
      this.vLatitudMarket= this.markerPositions[0].lat;
      this.vLongitudMarket= this.markerPositions[0].lng;
    }
















// This example requires the Places library. Include the libraries=places
// parameter when you first load the API. For example:
// <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places">

 initMap(): void {
    const map = new google.maps.Map(
      document.getElementById("map") as HTMLElement,
      {
        center: { lat: 40.749933, lng: -73.98633 },
        zoom: 13,
        mapTypeControl: false,
      }
    );
    const card = document.getElementById("pac-card") as HTMLElement;
    const input = document.getElementById("pac-input") as HTMLInputElement;
    const biasInputElement = document.getElementById(
      "use-location-bias"
    ) as HTMLInputElement;
    const strictBoundsInputElement = document.getElementById(
      "use-strict-bounds"
    ) as HTMLInputElement;
    const options = {
      fields: ["formatted_address", "geometry", "name"],
      strictBounds: false,
      types: ["establishment"],
    };
  
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(card);
  
    const autocomplete = new google.maps.places.Autocomplete(input, options);
  
    // Bind the map's bounds (viewport) property to the autocomplete object,
    // so that the autocomplete requests use the current map bounds for the
    // bounds option in the request.
    autocomplete.bindTo("bounds", map);
  
    const infowindow = new google.maps.InfoWindow();
    const infowindowContent = document.getElementById(
      "infowindow-content"
    ) as HTMLElement;
  
    infowindow.setContent(infowindowContent);
  
    const marker = new google.maps.Marker({
      map,
      anchorPoint: new google.maps.Point(0, -29),
    });
  
    autocomplete.addListener("place_changed", () => {
      infowindow.close();
      marker.setVisible(false);
  
      const place = autocomplete.getPlace();
  
      if (!place.geometry || !place.geometry.location) {
        // User entered the name of a Place that was not suggested and
        // pressed the Enter key, or the Place Details request failed.
        window.alert("No details available for input: '" + place.name + "'");
        return;
      }
  
      // If the place has a geometry, then present it on a map.
      if (place.geometry.viewport) {
        map.fitBounds(place.geometry.viewport);
      } else {
        map.setCenter(place.geometry.location);
        map.setZoom(17);
      }
  
      marker.setPosition(place.geometry.location);
      marker.setVisible(true);
  
      infowindowContent.children["place-name"].textContent = place.name;
      infowindowContent.children["place-address"].textContent =
        place.formatted_address;
      infowindow.open(map, marker);
    });
  
    // Sets a listener on a radio button to change the filter type on Places
    // Autocomplete.
    function setupClickListener(id, types) {
      const radioButton = document.getElementById(id) as HTMLInputElement;
  
      radioButton.addEventListener("click", () => {
        autocomplete.setTypes(types);
        input.value = "";
      });
    }
  
    setupClickListener("changetype-all", []);
    setupClickListener("changetype-address", ["address"]);
    setupClickListener("changetype-establishment", ["establishment"]);
    setupClickListener("changetype-geocode", ["geocode"]);
    setupClickListener("changetype-cities", ["(cities)"]);
    setupClickListener("changetype-regions", ["(regions)"]);
  
    biasInputElement.addEventListener("change", () => {
      if (biasInputElement.checked) {
        autocomplete.bindTo("bounds", map);
      } else {
        // User wants to turn off location bias, so three things need to happen:
        // 1. Unbind from map
        // 2. Reset the bounds to whole world
        // 3. Uncheck the strict bounds checkbox UI (which also disables strict bounds)
        autocomplete.unbind("bounds");
        autocomplete.setBounds({ east: 180, west: -180, north: 90, south: -90 });
        strictBoundsInputElement.checked = biasInputElement.checked;
      }
  
      input.value = "";
    });
  
    strictBoundsInputElement.addEventListener("change", () => {
      autocomplete.setOptions({
        strictBounds: strictBoundsInputElement.checked,
      });
  
      if (strictBoundsInputElement.checked) {
        biasInputElement.checked = strictBoundsInputElement.checked;
        autocomplete.bindTo("bounds", map);
      }
  
      input.value = "";
    });
  }


*/




















    
    /**|   97
     * Metodo que abre un modal para la gestion de Inversion
     */
/*
    ngOnInit() {
       this.initMap();
    }
    
 */

     
    /**
     * Valida Cada atributo del formulario
     * @param formGroup - Recibe cualquier tipo de FormGroup

    validateAllFormFields(formGroup: FormGroup) {           
        Object.keys(formGroup.controls).forEach(field => {  
            const control = formGroup.get(field);        
            if (control instanceof FormControl) {          
                control.markAsTouched({ onlySelf: true });
            } else if (control instanceof FormGroup) {      
                this.validateAllFormFields(control);      
            }
        });
    }


}
*/