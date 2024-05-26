
import orderModel from "../models/orderModel.js";
import { comparePassword, hashPassword } from "../helpers/authHelper.js";
import usermodel from "../models/usermodel.js";
import JWT from "jsonwebtoken";

export const registerController = async (req, res) => {

    try{
        const {name,email,password,phone,address, answer} = req.body;
        if(!name){
            return res.send({message:"Name is required"})
        }
        if(!email){
            return res.send({message:"email is required"})
        }
        if(!password){
            return res.send({message:"password  is required"})
        }
        if(!address){
            return res.send({message:"address is required"})
        }
        if(!phone){
            return res.send({message:"phone is required"})
        }
        if(!answer){
            return res.send({message:"answer is required"})
        }

        //check user
        const existinguser = await usermodel.findOne({  email   });
        //existing user
        if(existinguser){
            return res.status(200).send({
                success:false,
                message:" Already Register please login ",

            });
        }
//regiser user
        const hashedPassword = await hashPassword(password)
        //save
        const user = await new usermodel({name,email,phone,address,password: hashedPassword,answer}).save()

        res.status(201).send({
            success:true,
            message:"user Registered Successfully",
            user,
        });
    } catch (error){
        console.log(error);
        res.status(500).send({
            success:false,
            message:"error in register",
            error,
        })
    }
};

// post login
export const loginController = async(req,res) => {
    try{
        const {email,password} = req.body
        //validation
        if(!email || !password){
            return res.status(404).send({
                success:false,
                message:'Invalid email or password'
            })
        }
        const user = await usermodel.findOne({email})
        if(!user){
            return res.status(404).send({
                success:false,
                message:"email is not registered"
            })
        }
        const match = await comparePassword(password,user.password)
        if(!match){
            return res.status(200).send({
                success:false,
                message:"invalid password",
            });
        }
        //token
        const token = await JWT.sign({_id:user._id }, process.env.JWT_SECRET, {expiresIn:"7d",
    });
    res.status(200).send({
        success:true,
        message:"login successfully",
        user:{
            _id: user._id,
         name:user.name,
         email:user.email,
         phoe: user.phone,
         address:user.address,
         role: user.role,
        },
        token,
    });
    }catch(error){
        console.log(error);
        res.status(500).send({
            success:false,
            message:"Error in login",
            error,
        });
    }
};
//forgotPasswordController
export const forgotPasswordController = async (req, res) => {
    try {
      const { email, answer, newPassword } = req.body;
      if (!email) {
        res.status(400).send({ message: "Email is required" });
      }
      if (!answer) {
        res.status(400).send({ message: "answer is required" });
      }
      if (!newPassword) {
        res.status(400).send({ message: "New Password is required" });
      }
      //check
      const user = await usermodel.findOne({ email, answer });
      //validation
      if (!user) {
        return res.status(404).send({
          success: false,
          message: "Wrong Email Or Answer",
        });
      }
      const hashed = await hashPassword(newPassword);
      await usermodel.findByIdAndUpdate(user._id, { password: hashed });
      res.status(200).send({
        success: true,
        message: "Password Reset Successfully",
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Something went wrong",
        error,
      });
    }
  };
//test controller
export const testController =(req, res) => {
     try {
        res.send("protected Route");
     } catch (error) {
        console.log(error);
        res.send({error});
     }

};
//update profile
export const updateProfileController = async (req, res) => {
    try {
      const { name, email, password, address, phone } = req.body;
      const user = await usermodel.findById(req.user._id);
      //password
      if (password && password.length < 6) {
        return res.json({ error: "Passsword is required and 6 character long" });
      }
      const hashedPassword = password ? await hashPassword(password) : undefined;
      const updatedUser = await usermodel.findByIdAndUpdate(
        req.user._id,
        {
          name: name || user.name,
          password: hashedPassword || user.password,
          phone: phone || user.phone,
          address: address || user.address,
        },
        { new: true }
      );
      res.status(200).send({
        success: true,
        message: "Profile Updated SUccessfully",
        updatedUser,
      });
    } catch (error) {
      console.log(error);
      res.status(400).send({
        success: false,
        message: "Error WHile Update profile",
        error,
      });
    }
  };

  //orders
export const getOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({ buyer: req.user._id })
      .populate("products", "-photo")
      .populate("buyer", "name");
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error WHile Geting Orders",
      error,
    });
  }
};
//orders
export const getAllOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({})
      .populate("products", "-photo")
      .populate("buyer", "name")
      .sort({ createdAt: "-1" });
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error WHile Geting Orders",
      error,
    });
  }
};

//order status
export const orderStatusController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const orders = await orderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error While Updateing Order",
      error,
    });
  }
};