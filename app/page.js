'use client';
import { useState, useEffect } from 'react';
import { Box, Stack, Typography, Button, Modal, TextField, Select, MenuItem } from '@mui/material';
import { auth, firestore } from '@/firebase';
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc
} from 'firebase/firestore';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
};

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [supplier, setSupplier] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(10);
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        updateInventory();
      } else {
        setInventory([]);
      }
    });
    return () => unsubscribe();
  }, [user]);

  const updateInventory = async () => {
    if (user) {
      const snapshot = query(collection(firestore, 'inventory'));
      const docs = await getDocs(snapshot);
      const inventoryList = [];
      docs.forEach((doc) => {
        inventoryList.push({ name: doc.id, ...doc.data() });
      });
      setInventory(inventoryList);
    }
  };

  const addItem = async () => {
    if (user && itemName && category) {
      const docRef = doc(collection(firestore, 'inventory'), itemName);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const { quantity } = docSnap.data();
        await setDoc(docRef, { quantity: quantity + 1, category, description, price, supplier });
      } else {
        await setDoc(docRef, { quantity: 1, category, description, price, supplier });
      }
      await updateInventory();
      setItemName('');
      setCategory('');
      setDescription('');
      setPrice('');
      setSupplier('');
      handleClose();
    }
  };

  const removeItem = async (item) => {
    if (user) {
      const docRef = doc(collection(firestore, 'inventory'), item);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const { quantity } = docSnap.data();
        if (quantity === 1) {
          await deleteDoc(docRef);
        } else {
          await setDoc(docRef, { quantity: quantity - 1 });
        }
      }
      await updateInventory();
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const filteredInventory = inventory
    .filter(item =>
      (selectedCategory ? item.category === selectedCategory : true) &&
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  return (
    <Box
      width="100vw"
      height="100vh"
      display={'flex'}
      justifyContent={'center'}
      flexDirection={'column'}
      alignItems={'center'}
      gap={2}
    >
      {user ? (
        <>
          <Button variant="contained" onClick={handleLogout}>Logout</Button>
          <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={style}>
              <Typography id="modal-modal-title" variant="h6" component="h2">
                Add Item
              </Typography>
              <Stack width="100%" direction={'column'} spacing={2}>
                <TextField
                  label="Item Name"
                  variant="outlined"
                  fullWidth
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                />
                <TextField
                  label="Category"
                  variant="outlined"
                  fullWidth
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
                <TextField
                  label="Description"
                  variant="outlined"
                  fullWidth
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <TextField
                  label="Price"
                  variant="outlined"
                  fullWidth
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
                <TextField
                  label="Supplier"
                  variant="outlined"
                  fullWidth
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                />
                <Button
                  variant="outlined"
                  onClick={addItem}
                >
                  Add
                </Button>
              </Stack>
            </Box>
          </Modal>
          <Button variant="contained" onClick={handleOpen}>Add New Item</Button>
          <Box border={'1px solid #333'}>
            <Box
              width="800px"
              height="100px"
              bgcolor={'#ADD8E6'}
              display={'flex'}
              justifyContent={'center'}
              alignItems={'center'}
            >
              <Typography variant={'h2'} color={'#333'} textAlign={'center'}>
                Inventory Items
              </Typography>
            </Box>
            <Stack width="800px" spacing={2}>
              <Stack direction="row" spacing={2} mb={2}>
                <TextField
                  label="Search"
                  variant="outlined"
                  fullWidth
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  displayEmpty
                >
                  <MenuItem value="">All Categories</MenuItem>
                  <MenuItem value="Raw Ingredients">Raw Ingredients</MenuItem>
                  <MenuItem value="Prepared Ingredients">Prepared Ingredients</MenuItem>
                  <MenuItem value="Finished Goods">Finished goods</MenuItem>
                  <MenuItem value="Kitchen Supplies"> Kitchen Supplies</MenuItem>
                  {/* Add more categories as needed */}
                </Select>
              </Stack>
              <Stack width="100%" height="300px" spacing={2} overflow={'auto'}>
                {filteredInventory.map(({ name, quantity }) => (
                  <Box
                    key={name}
                    width="100%"
                    minHeight="150px"
                    display={'flex'}
                    justifyContent={'space-between'}
                    alignItems={'center'}
                    bgcolor={'#f0f0f0'}
                    paddingX={5}
                  >
                    <Typography variant={'h3'} color={'#333'} textAlign={'center'}>
                      {name.charAt(0).toUpperCase() + name.slice(1)}
                    </Typography>
                    <Typography variant={'h3'} color={'#333'} textAlign={'center'}>
                      Quantity: {quantity}
                    </Typography>
                    <Button variant="outlined" onClick={() => removeItem(name)}>
                      Remove
                    </Button>
                  </Box>
                ))}
              </Stack>
            </Stack>
          </Box>
        </>
      ) : (
        <Stack spacing={2} alignItems="center">
          <Typography variant="h5">Please Login</Typography>
          <TextField
            label="Email"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button variant="contained" onClick={handleLogin}>Login</Button>
        </Stack>
      )}
      
  </Box>
    );
  }