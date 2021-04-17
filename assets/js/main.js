function toggleNav(){
    var navholder = document.getElementById("navholder");
    navholder.setAttribute("mnav-active", navholder.getAttribute("mnav-active")=="true" ? "false" : "true")
}