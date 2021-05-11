# Proiect Cloud Computing

# Introducere
Am creat acest proiect cu scopul de a ne putea bucura de un cocktail preparat de noi in propria noastra casa, dat fiind contextul pandemiei si al imposibilitatii de a mai putea petrece timp cu prietenii in localuri, restaurante si terase.

## Descriere problema
In ultimul an petrecut in casa, datorata pandemiei de COVID-19, m-am gandit ca o aplicatie web care sa ne ajute la destinderea atmosferei ar fi bine venita. In acest fel putem sa ne bucuram impreuna cu prietenii apropiati sau cu familia de preparate poate chiar mai bune decat la baruri, preparate chiar de noi si care sunt mult mai putin costisitoare. O problema destul de des intalnita este, pe de o parte, lipsa unor retete disponibile online, iar pe de alta parte felul in care putem folosi produsele de care dispunem la prepararea unor retete delicioase de cocktail-uri. 
In aplicatie putem vizualia lista ingredientelor de care dispunem pentru a putea prepara cocktail-urile dorite (link poza 1), si de asemenea putem adauga ingrediente noi prin completarea unui formular in care introducem denumirea ingredientului, cantitatea si pretul (link poza 2).

## Prezentare API-uri utilizate
Pentru realizarea funcționalităților prezentate anterior, am utilizat 2 API-uri: TheCocktailDB (https://www.thecocktaildb.com/api.php) si Gmail API.
TheCocktailDB API  oferă o bază de date universal cu băuturi și cocktail-uri din întreaga lume. Acest API permite cautarea in baza lor de cocktailuri dupa categorie, nume, ingredient etc. In aplicatie am folosit l-am folosit pentru introducerea de ingrediente necesate pentru cocktail-uri, iar fiecare ingredient adaugat vine insotit de o scurta descriere.
Gmail API este un RESTful API ce este folosit pentru a accesa casuta de Gmail si de a trimite mail-uri. Pentru cele mai multe aplicatii, Gmail API este cea mai buna solutie pentru accesul la datele din Gmail. Acesta poate fi folosit la citirea de mail-uri, adaugarea sau stergerea filtrelor, automatizarea sau programarea trimiterii mesajelor, migrarea email-uriloe catre alt provider.
In aplicatia mea, am utilizat Gmail API pentru a putea automatiza trimiterea de mesaje in momentul in care este adaugat un nou ingredient la lista mea.

##Descriere flux de date
Utilizatorul aplicatiei intra pe pagina principala:
-insereaza un nou ingredient
-datele indroduse se vor salva 
-pe baza numelui ingredientului se va accesa API-ul de ingrediente utilizat
-dupa identificarea ingredientului, acesta va returna o descreire
-obientul se va salva in baza de date
-vom primi un mail cum ca lista noastra de ingrediente a fost actualizata.

## Exemple de request/response
#Afisarea ingredientelor:
app.get('/products', async(req, res)=>{
  try{
    let products = await Product.findAll();
    res.status(200).json(products)
  }catch(e){
    console.warn(e);
    res.status(500).json({ message: "Could not retrieve data" });
  }
})

#Salvarea ingredientelor:
app.post('/products', async(req,res)=>{
  try{
    let description = await getIngredientInfo(req.body.name)
    
    const product = {
      name: req.body.name,
      quantity: req.body.quantity,
      price: req.body.price,
      description: description
    }
    await Product.create(product)
    SendEmail()
    res.status(201).json({ message: "Product " + product.name + " was created" });
  }catch(e){
    console.warn(e);
    res.status(500).json({ message: "Could not create new product" });
  } 
})

#Update ingredient
app.put('/products/:name', async(req, res)=>{
  try{
    let product = await Product.findOne({where: {name: req.params.name}})
    if(product){
      await product.update(req.body);
      res.status(202).json({ message: "Product " + req.params.name + " was updated" });
    }
  }catch(e){
    console.warn(e);
    res.status(500).json({ message: "Could not update product" });
  }
})

#Stergere ingredient
app.delete('/products/:name', async (req,res)=>{
  try {
    let product = await Product.findOne({where: {name: req.params.name}});
    if (product) {
      await product.destroy();
      email_params.Message.Body.Html.Data = "Product " + req.params.name + " was deleted"
      res.status(200).json({ message: "Product " + req.params.name + " was deleted" });
    } else {
      res.status(200).json({ message: "Product " + req.params.name + " was not found" });
    }
  } catch (e) {
    console.warn(e);
    res.status(500).json({ message: "Could not delete product record" });
  }
})
