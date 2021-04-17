import * as THREE from './three.module.js'

// Materials used for the cheese and crust. These are just plain coloured but we will use the MeshPhongMaterial to allow it to be affected by lighting
const cheeseMaterial = new THREE.MeshPhongMaterial({color: 0xffde98});
const crustMaterial = new THREE.MeshPhongMaterial({color: "rgb(219,162,74)"});

/*
    Property definitions for the Pizza Sizes
*/
const PizzaSizes = {
    "small": {
        baseRadius: 1.5,        // Radius of the Pizza Base
        baseThickness: 0.08,    // Thickness or Height of the base
        crustTube: 0.1,         // Tube size of the crust
        crustRadius: 1.5-0.05,  // Radius of the crust
        cuts: 2,                // Number of cuts to make in the Pizza. 2 cuts means 4 slices, 3 cuts means 6 slices and so on
        toppingRadius: 0.9,     // Maximum horizontal radius within with toppings should spawn on the pizza
        toppingCount: 10,       // Base topping count. This may be multiplied or divided by some constant factor depending on the size of the topping
    },
    "medium": {
        baseRadius: 1.8,
        baseThickness: 0.1,
        crustTube: 0.1,
        crustRadius: 1.8-0.05,
        cuts: 3,
        toppingRadius: 1.2,
        toppingCount: 15,
    },
    "large": {
        baseRadius: 2.25,
        baseThickness: 0.1,
        crustTube: 0.1,
        crustRadius: 2.25-0.05,
        cuts: 4,
        toppingRadius: 1.5,
        toppingCount: 20,
    },
}

class PizzaRenderer{
    constructor(holder){
        this.toppingList = []
        this.init(holder)
        
    }

    /*
        Initialize ThreeJS and our Pizza Renderer 
    */
    
    init(holder){
        const options = {
            fov: 75,
            aspect: 1,
            near: 0.1,
            far: 10
        }

        const renderer = new THREE.WebGLRenderer({alpha: true,antialias: true});    // Allow the background to be transparent and enable anti-aliasing
        this.holder = holder;
        this.renderer = renderer;
        this.resize()
        window.addEventListener('resize',_=>{
            this.resize()
        })
        holder.appendChild(renderer.domElement)

        const camera = new THREE.PerspectiveCamera(options.fov,options.aspect,options.near,options.far);
        camera.position.z = 5;
        camera.position.y = 2;

        const scene = new THREE.Scene();
        
        /*
            Lighting        
        */
        {
            let light = new THREE.DirectionalLight(0xFFFFFF, 1);
            light.position.set(0, 2, 1);
            scene.add(light);
        }
        {
            let light = new THREE.AmbientLight(0xffde98, 0.15);
            light.position.set(0, 2, 1);
            scene.add(light);
        }
        {
            let light = new THREE.DirectionalLight(0x5b270d, 1);
            light.position.set(0, -2, 1);
            scene.add(light);
        }
        
        this.scene = scene;
        this.changePizzaBase("small"); 
        
        let animate = _=>{
            renderer.render(scene,camera);
            requestAnimationFrame(animate);
            this.pizzaGroup.rotation.y+=0.01;
        }
        animate();
    }

    resize(){
        this.renderer.setSize(this.holder.clientWidth,this.holder.clientHeight)
    }
    
    /*
        Change the size of our Pizza base while replacing the rendered the model. This re-adds the toppings as well
    */
    changePizzaBase(base="small"){
        this.size = PizzaSizes[base]
        this.scene.remove(this.pizzaGroup)
        const pizzaGroup = this.createPizzaBase(base);
        pizzaGroup.position.y = 0;
        for(let i=0;i<this.toppingList.length;i++){
            pizzaGroup.add(ToppingRenderers[this.toppingList[i]].getModel(this))
        }
        this.scene.add(pizzaGroup);
        this.pizzaGroup = pizzaGroup;
    }

    /*
        Create the Pizza Base Model (without toppings)
    */
    createPizzaBase(size="small"){
        var s = PizzaSizes[size];
        var pizzaGroup = new THREE.Group();
        var pizzaBase = new THREE.Mesh(new THREE.CylinderGeometry(s.baseRadius,s.baseRadius,s.baseThickness,40), cheeseMaterial);
        var pizzaCrust = new THREE.Mesh(new THREE.TorusGeometry(s.crustRadius,s.crustTube,40,40), crustMaterial);
        pizzaCrust.rotation.x  = Math.PI/2
        pizzaGroup.add(pizzaBase)
        pizzaGroup.add(pizzaCrust)

        // Add the cut lines in
        for(let i=0;i<s.cuts;i++){
            let line = new THREE.Mesh(new THREE.BoxGeometry(2*s.baseRadius,0.11,0.01), new THREE.MeshBasicMaterial({color: "rgb(219,162,74)"}));
            line.rotation.y = i*Math.PI/s.cuts;
            pizzaGroup.add(line)
            
        }
        return pizzaGroup
    }
}

/*
    Topping Renderers
    id: Internal ID of the topping
    material: Material to be used for the topping. Will define it's color, texture and reflective properties
    geometry: The geometry for the topping. Will define it's shape and model
*/

var ToppingRenderers = {
    pepperoni: {
        id: "pepperoni",
        material: new THREE.MeshPhongMaterial({color: "rgb(219,162,74)"}),
        geometry: new THREE.CylinderGeometry(0.2,0.2,0.01,20),
        getModel: function(pr){
            let thisRenderer = ToppingRenderers.pepperoni;
            let group = new THREE.Group();
            for(let i=0;i<pr.size.toppingCount/2;i++){
                // Choose a random x and z value for this piece of topping in the range of [-toppingRadius,toppingRadius]
                let x = Math.random()*pr.size.toppingRadius*(Math.random()>0.5 ? 1 : -1);
                let z = Math.random()*pr.size.toppingRadius*(Math.random()>0.5 ? 1 : -1);
                let mesh = new THREE.Mesh(thisRenderer.geometry,thisRenderer.material);
                mesh.position.x = x;
                mesh.position.z = z;
                group.add(mesh)
            }
            group.position.y = pr.size.baseThickness
            return group
        }
    },
    sausages: {
        id: "sausages",
        material: new THREE.MeshPhongMaterial({color: "rgb(219,162,74)"}),
        geometry: new THREE.CylinderGeometry(0.09,0.09,0.07,20),
        getModel: function(pr){
            let thisRenderer = ToppingRenderers.sausages;
            let group = new THREE.Group();
            for(let i=0;i<pr.size.toppingCount;i++){
                let x = Math.random()*pr.size.toppingRadius*(Math.random()>0.5 ? 1 : -1);
                let z = Math.random()*pr.size.toppingRadius*(Math.random()>0.5 ? 1 : -1);
                let mesh = new THREE.Mesh(thisRenderer.geometry,thisRenderer.material);
                mesh.position.x = x;
                mesh.position.z = z;
                group.add(mesh)
            }
            group.position.y = pr.size.baseThickness
            return group
        }
    },
    paneer: {
        id: "paneer",
        material: new THREE.MeshPhongMaterial({color: "#FFFFFF"}),
        geometry: new THREE.BoxGeometry(0.1,0.1,0.1),
        getModel: function(pr){
            let thisRenderer = ToppingRenderers.paneer;
            let group = new THREE.Group();
            for(let i=0;i<pr.size.toppingCount;i++){
                let x = Math.random()*pr.size.toppingRadius*(Math.random()>0.5 ? 1 : -1);
                let z = Math.random()*pr.size.toppingRadius*(Math.random()>0.5 ? 1 : -1);
                let mesh = new THREE.Mesh(thisRenderer.geometry,thisRenderer.material);
                mesh.position.x = x;
                mesh.position.z = z;
                group.add(mesh)
            }
            group.position.y = pr.size.baseThickness
            return group
        }
    },
    corn: {
        id: "corn",
        material: new THREE.MeshPhongMaterial({color: "#FFD700"}),
        geometry: new THREE.BoxGeometry(0.05,0.05,0.08),
        getModel: function(pr){
            let thisRenderer = ToppingRenderers.corn;
            let group = new THREE.Group();
            for(let i=0;i<pr.size.toppingCount*2;i++){
                let x = Math.random()*pr.size.toppingRadius*(Math.random()>0.5 ? 1 : -1);
                let z = Math.random()*pr.size.toppingRadius*(Math.random()>0.5 ? 1 : -1);
                let mesh = new THREE.Mesh(thisRenderer.geometry,thisRenderer.material);
                mesh.position.x = x;
                mesh.position.z = z;
                group.add(mesh)
            }
            group.position.y = pr.size.baseThickness
            return group
        }
    },
    capsicum: {
        id: "capsicum",
        material: new THREE.MeshPhongMaterial({color: "#228B22"}),
        geometry: new THREE.BoxGeometry(0.05,0.05,0.2),
        getModel: function(pr){
            let thisRenderer = ToppingRenderers.capsicum;
            let group = new THREE.Group();
            for(let i=0;i<pr.size.toppingCount;i++){
                let x = Math.random()*pr.size.toppingRadius*(Math.random()>0.5 ? 1 : -1);
                let z = Math.random()*pr.size.toppingRadius*(Math.random()>0.5 ? 1 : -1);
                let mesh = new THREE.Mesh(thisRenderer.geometry,thisRenderer.material);
                mesh.position.x = x;
                mesh.position.z = z;
                mesh.rotation.y = Math.random()*Math.PI;
                group.add(mesh)
            }
            group.position.y = pr.size.baseThickness
            return group
        }
    }
    
}

export default PizzaRenderer;