import './App.css';
import axios from "axios";
import Button from "@material-ui/core/Button";
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import {useEffect, useState} from "react";
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import {makeStyles} from '@material-ui/core/styles';
import {CircularProgress, Grid, Typography} from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import Tooltip from "@material-ui/core/Tooltip";
import IconButton from '@material-ui/core/IconButton';
import {toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



const useStyles = makeStyles((theme) => ({
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection:"column",
    margin: theme.spacing(5)
  },
  buttonContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    margin: theme.spacing(5)
  },
  dataGridContainer:{
    width:"100%",
  },
  paper: {
    width: '30%',
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));


function App() {
  toast.configure();
  const classes = useStyles();
  const [isModalOpened, setIsModalOpened] = useState(false);
  const [isEditing,setIsEditing]=useState(false);
  const [productsData,setProductsData]=useState({});
  const [itemData, setItemData] = useState({
    name:'',
    price:'',
    quantity:'',
  })
  const [count,setCount]=useState(0);

  useEffect(() => {
    axios.get('http://18.221.64.136:5000/products')
        .then(response => {
          const {data}=response;
          setProductsData(data);
          console.log('Get!')
        })
        .catch((error) => {
          console.log('Error:',error);
        })
  },[count])

  const handleItemData = () => {
    axios.post("http://18.221.64.136:5000/products",itemData)
        .then(res => {
          setProductsData([...productsData,itemData]);
          setCount(count+1);
          console.log('Count:',count)
          toast.success(`Product added successfully`, {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: false,
            progress: undefined,
          });
        })
        .catch(err => console.log('Error',err))
  }

  const handleEdit = () => {

    console.log('Item data:',itemData);
    axios.put(`http://18.221.64.136:5000/products/${itemData.name}`,itemData)
        .then(() =>{
          const arrayCopy=productsData.slice();
          arrayCopy.forEach(item => {
            if(item.name===itemData.name) {
              item.name=itemData.name;
              item.quantity=itemData.quantity;
              item.price=parseInt(itemData.price);
            }
          })
          toast.success(`Product edited successfully`, {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: false,
            progress: undefined,
          });
          handleModalClose();
        })
        .catch(error => {
          console.log('Error',error);
        })
  }

  const handleDeleteItem = (row) => {
    const item=(productsData.find(row2 => row2.id===row.id));
    axios.delete(`http://18.221.64.136:5000/products/${item.name}`)
        .then(() => {
          console.log('Deleted item!');
          toast.success(`Product deleted successfully`, {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: false,
            progress: undefined,
          });
        })
        .catch((error) => {
          console.log('Error:',error);

        })
  }

  const handleModalOpen = () => {
    setIsModalOpened(true);

  };

  const handleModalClose = () => {
    setIsModalOpened(false);
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    setItemData({...itemData, [e.target.name]:e.target.value});
  }


  const handleAddItem = () => {
    setItemData({
      name:'',
      price:'',
      quantity:''
    })
    setIsEditing(false);
    handleModalOpen();
  }

  const handleEditItem = (row) => {
    const item=(productsData.find(row2 => row2.id===row.id));
    setItemData({
      name:item.name,
      price:item.price,
      quantity: item.quantity,
    });
    console.log('Item data:',itemData);
    setIsEditing(true);
    handleModalOpen();
  }

  return (
      <div className={classes.container}>
        <Typography variant="h3" component="h2">
          Cocktail ingredients  list
        </Typography>
        <div className={classes.buttonContainer}>

          <Button
              variant="contained"
              color="primary"
              className={'my-food-add-button'}
              startIcon={<AddCircleOutlineIcon/>}
              onClick={handleAddItem}
          >
            Add item
          </Button>
        </div>

        <div className={classes.dataGridContainer}>
          <TableContainer component={Paper}>
            <Table >
              <TableHead>
                <TableRow color="primary">

                  <TableCell>Item</TableCell>
                  <TableCell align="center">Description&nbsp;</TableCell>
                  <TableCell align="right">Price&nbsp;($USD)</TableCell>
                  <TableCell align="right">Quantity&nbsp;</TableCell>
                  <TableCell align="right">Edit&nbsp;</TableCell>
                  <TableCell align="right">Delete&nbsp;</TableCell>

                </TableRow>
              </TableHead>
              <TableBody>
                {productsData ? Object.values(productsData).map((product) => (
                    <TableRow key={product.id}>
                      <TableCell component="th" scope="row">
                        {product.name}
                      </TableCell>
                      <TableCell align="center">{product.description}</TableCell>
                      <TableCell align="right">{product.price}</TableCell>
                      <TableCell align="right">{product.quantity}</TableCell>
                      <TableCell align={"right"}><Tooltip title={"Edit this item"}>
                        <IconButton aria-label={"edit product"}>
                          <EditIcon onClick={() => handleEditItem(product)}/>
                        </IconButton>
                      </Tooltip></TableCell>
                      <TableCell align={"right"}><Tooltip title={"Delete this item"}>
                        <IconButton aria-label={"delete product"}>
                          <DeleteIcon onClick={() => handleDeleteItem(product)} />
                        </IconButton>
                      </Tooltip></TableCell>
                    </TableRow>
                )): <CircularProgress />}

              </TableBody>
            </Table>
          </TableContainer>
        </div>

        <Modal
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            className={classes.modal}
            open={isModalOpened}
            onClose={handleModalClose}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
              timeout: 500,
            }}
        >
          <Fade in={isModalOpened}>
            <div className={classes.paper}>
              <div className="modal-header">Add item</div>
              <form className={classes.form} noValidate>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="name"
                        label="Name"
                        name="name"
                        value={itemData.name}
                        onChange={handleInputChange}
                        autoFocus
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="price"
                        label="Price"
                        name="price"
                        value={itemData.price}
                        onChange={handleInputChange}
                        autoFocus
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="quantity"
                        label="Quantity"
                        name="quantity"
                        value={itemData.quantity}
                        onChange={handleInputChange}
                        autoFocus
                    />
                  </Grid>
                  <Grid item xs={12} direction={"row"} justify={"center"} alignItems={"center"}>
                    {isEditing ? <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        className={classes.submit}
                        onClick={handleEdit}
                    >
                      Edit product
                    </Button> :
                        <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            className={classes.submit}
                            onClick={handleItemData}
                        >
                          Add product
                        </Button>}

                  </Grid>


                </Grid>

              </form>
            </div>
          </Fade>
        </Modal>
      </div>
  );
}

export default App;
