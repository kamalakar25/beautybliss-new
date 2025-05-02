"use client";

import { useState, useEffect } from "react";
import { Box, IconButton } from "@mui/material";
import { styled } from "@mui/material/styles";
import FilterListIcon from "@mui/icons-material/FilterList";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// Import images
import salonImage from "../Assets/salon.jpg";

const Home = () => {
  const navigate = useNavigate();
  const [serviceProviders, setServiceProviders] = useState([]);
  const [filteredProviders, setFilteredProviders] = useState([]);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [addresses, setAddresses] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const itemsPerPage = 5;

  const handleClick = () => {
    navigate("/salon");
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const BASE_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchServiceProviders = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/api/main/admin/get/all/service-providers`
        );
        const providers = response.data;
        setServiceProviders(providers.reverse());
        setFilteredProviders(providers);
      } catch (error) {
        setError("Failed to load service providers. Please try again.");
      }
    };
    fetchServiceProviders();
  }, []);

  useEffect(() => {
    let filtered = serviceProviders;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((provider) => {
        const fieldsToSearch = [
          provider.name || "",
          provider.email || "",
          provider.phone || "",
          provider.shopName || "",
          provider.designation || "",
          provider.location || "",
          formatDate(provider.createdAt) || "",
          formatDate(provider.dob) || "",
        ];
        return fieldsToSearch.some((field) =>
          field.toLowerCase().includes(query)
        );
      });
    }

    // Apply date filters
    if (startDateFilter || endDateFilter) {
      filtered = filtered.filter((provider) => {
        if (!provider.createdAt) return false;
        try {
          const joinDate = new Date(provider.createdAt);
          if (isNaN(joinDate.getTime())) return false;
          const startDate = startDateFilter ? new Date(startDateFilter) : null;
          const endDate = endDateFilter ? new Date(endDateFilter) : null;
          if (endDate) endDate.setHours(23, 59, 59, 999);
          if (startDate && endDate) {
            return joinDate >= startDate && joinDate <= endDate;
          } else if (startDate) {
            return joinDate >= startDate;
          } else if (endDate) {
            return joinDate <= endDate;
          }
          return true;
        } catch (error) {
          return false;
        }
      });
    }

    setFilteredProviders(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchQuery, startDateFilter, endDateFilter, serviceProviders]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (error) {
      return "Invalid Date";
    }
  };

  const clearAllFilters = () => {
    setStartDateFilter("");
    setEndDateFilter("");
    setSearchQuery("");
    setShowFilters(false); // Hide filters on clear
  };

  const parseCoordinates = (location) => {
    if (!location || typeof location !== "string") {
      return { latitude: null, longitude: null };
    }
    try {
      const latMatch = location.match(/Lat: ([\d.-]+)/);
      const lonMatch = location.match(/Lon: ([\d.-]+)/);
      const latitude = latMatch ? Number.parseFloat(latMatch[1]) : null;
      const longitude = lonMatch ? Number.parseFloat(lonMatch[1]) : null;
      return { latitude, longitude };
    } catch (error) {
      return { latitude: null, longitude: null };
    }
  };

  const handleToggleFilters = () => {
    setShowFilters((prev) => !prev);
  };

  const totalPages = Math.ceil(filteredProviders.length / itemsPerPage);
  const paginatedProviders = filteredProviders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      // Handle backdrop click
    }
  };

  const getMapLink = (location) => {
    const { latitude, longitude } = parseCoordinates(location);
    const lat = latitude !== null ? latitude : 17.359699; // Default latitude
    const lon = longitude !== null ? longitude : 78.534277; // Default longitude
    return `https://www.google.com/maps?q=${lat},${lon}`;
  };

  // Styled FilterToggleButton
  const FilterToggleButton = styled(IconButton)(({ theme }) => ({
    display: "none",
    [theme.breakpoints.down("lg")]: {
      display: "block",
      color: "#201548",
      backgroundColor: "transparent",
      "&:hover": {
        backgroundColor: "rgba(32, 21, 72, 0.1)",
      },
    },
  }));

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        minHeight: "100vh",
        color: "rgb(244,245,247)",
      }}
    >
      {/* Hero Section */}
      <div
        className="container-fluid d-flex align-items-center justify-content-center px-3 px-md-5"
        style={{ backgroundColor: "rgb(233, 235, 238)", minHeight: "82vh" }}
      >
        <style>
          {`
            /* Button Styles */
            .btn-conteiner {
              display: flex;
              justify-content: center;
              --color-text: rgb(244,245,247);
              --color-background: #201548;
              --color-outline: rgba(32, 21, 72, 0.5);
              --color-shadow: rgba(32, 21, 72, 0.5);
            }

            .btn-content {
              display: flex;
              align-items: center;
              padding: 12px 30px;
              text-decoration: none;
              font-family: 'Poppins', sans-serif;
              font-weight: 600;
              font-size: 18px;
              color: var(--color-text);
              background: var(--color-background);
              transition: all 0.5s ease;
              border-radius: 50px;
              box-shadow: 0 5px 15px var(--color-shadow);
              border: none;
              position: relative;
              overflow: hidden;
              z-index: 1;
            }

            .btn-content::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              width: 0%;
              height: 100%;
              background: rgba(255, 255, 255, 0.2);
              transition: all 0.5s ease;
              z-index: -1;
            }

            .btn-content:hover::before {
              width: 100%;
            }

            .btn-content:hover, .btn-content:focus {
              transform: translateY(-3px);
              box-shadow: 0 8px 20px var(--color-shadow);
            }

            .btn-content .icon-arrow {
              transition: 0.5s;
              margin-right: 0px;
              transform: scale(0.6);
            }

            .btn-content:hover .icon-arrow {
              transition: 0.5s;
              margin-right: 25px;
            }

            .icon-arrow {
              width: 20px;
              margin-left: 15px;
              position: relative;
              top: 6%;
            }

            #arrow-icon-one, #arrow-icon-two, #arrow-icon-three {
              fill: #ffffff;
              transition: 0.4s;
              transform: translateX(-60%);
            }

            .btn-content:hover #arrow-icon-one {
              transform: translateX(0%);
              animation: color_anim 1s infinite 0.6s;
            }

            .btn-content:hover #arrow-icon-two {
              transform: translateX(0%);
              animation: color_anim 1s infinite 0.4s;
            }

            .btn-content:hover #arrow-icon-three {
              animation: color_anim 1s infinite 0.2s;
            }

            @keyframes color_anim {
              0% { fill: white; }
              50% { fill: rgba(255, 255, 255, 0.5); }
              100% { fill: white; }
            }

            /* Responsive Styles */
            @media (max-width: 576px) {
              .btn-content {
                font-size: 16px;
                padding: 10px 20px;
              }
              .icon-arrow {
                width: 15px;
                margin-left: 10px;
              }
            }

            /* Skincare Section Responsive */
            @media (max-width: 767px) {
              #skincare .col-md-6.text-start {
                text-align: center !important;
                padding: 0 15px;
              }

              #skincare h2.section-title {
                font-size: 1.8rem !important;
                margin-bottom: 1rem;
              }

              #skincare h3.fw-bold {
                font-size: 1.5rem !important;
                line-height: 1.4;
              }

              #skincare p.lead {
                font-size: 1rem !important;
                line-height: 1.5;
                max-width: 100%;
              }

              #skincare ul.list-unstyled li {
                max-width: 100% !important;
                padding: 10px 15px;
                font-size: 0.9rem;
              }

              #skincare .animate__animated {
                animation-duration: 0.8s;
              }

              #skincare .img-wrapper {
                position: relative !important;
                top: 0 !important;
                left: 0 !important;
                margin-bottom: 10px;
              }

              #skincare .custom-img {
                width: 330px;
                height: 200px !important;
                max-width: 300px;
                margin: 0 auto;
              }

              #skincare .position-relative.d-flex {
                height: auto !important;
                flex-direction: column;
                align-items: center;
              }
            }

            /* General Styles */
            ul.list-unstyled li {
              width: 100%;
              max-width: 100%;
              box-sizing: border-box;
            }

            section#skincare {
              padding: 30px 0;
            }

            #skincare .col-md-6.text-start p,
            #skincare .col-md-6.text-start li {
              word-wrap: break-word;
            }

            /* Section Titles */
            .section-title {
              color: #201548;
              font-weight: 700;
              position: relative;
              display: inline-block;
              margin-bottom: 1.5rem;
            }

            .section-title::after {
              content: '';
              position: absolute;
              bottom: -10px;
              left: 0;
              width: 60px;
              height: 3px;
              background: #201548;
              border-radius: 2px;
            }

            /* Card Hover Effects */
            .hover-card {
              transition: all 0.3s ease;
              border: 1px solid rgba(32, 21, 72, 0.1);
              border-radius: 12px;
              overflow: hidden;
            }

            .hover-card:hover {
              transform: translateY(-10px);
              box-shadow: 0 15px 30px rgba(32, 21, 72, 0.2);
            }

            /* Image Hover Effects */
            .img-hover {
              transition: all 0.5s ease;
              overflow: hidden;
            }

            .img-hover img {
              transition: all 0.5s ease;
            }

            .img-hover:hover img {
              transform: scale(1.05);
            }

            /* Custom Animations */
            @keyframes fadeUp {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }

            .fade-up {
              animation: fadeUp 0.8s ease forwards;
            }

            /* Staggered Animation Delays */
            .delay-1 { animation-delay: 0.1s; }
            .delay-2 { animation-delay: 0.2s; }
            .delay-3 { animation-delay: 0.3s; }
            .delay-4 { animation-delay: 0.4s; }
            .delay-5 { animation-delay: 0.5s; }
          `}
        </style>

        <div className="row w-100 align-items-center g-4" >
          <div className="col-md-6 text-center text-md-start">
            <motion.h1
              className="display-4 fw-bold"
              style={{ color: "#0e0f0f" }}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Your One-Stop{" "}
              <span style={{ color: "#201548" }}>Beauty Destination</span>
            </motion.h1>

            <motion.p
              className="mt-3"
              style={{ color: "#0e0f0f", fontSize: "1.1rem" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Discover expert services from salon to skincare in one elegant
              space.
            </motion.p>

            <motion.div
              className="mt-4 d-flex flex-column flex-sm-row flex-wrap gap-3 justify-content-center justify-content-md-start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <div className="btn-conteiner">
                <a href="/salon" className="btn-content">
                  <span>Salon</span>
                  
                </a>
              </div>

              <div className="btn-conteiner">
                <a href="/beauty" className="btn-content">
                  <span>Beauty</span>
                 
                </a>
              </div>

              <div className="btn-conteiner">
                <a href="/skincare" className="btn-content">
                  <span>Skincare</span>
                 
                </a>
              </div>
            </motion.div>
          </div>

          <motion.div
            className="col-md-6 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="img-hover">
              <img
                src={salonImage || "/placeholder.svg"}
                alt="Beauty Services"
                className="img-fluid rounded"
                style={{
                  maxHeight: "320px",
                  objectFit: "cover",
                  border: `2px solid #201548`,
                  boxShadow: "0 20px 40px rgba(32, 21, 72, 0.3)",
                  width: "100%",
                  maxWidth: "500px",
                }}
              />
            </div>
          </motion.div>
        </div>
      </div>

   

      {/* Main Content Container */}
      <div className="container-fluid px-0">
        {/* Salon Section */}
        <section
          className="py-5"
          id="salon"
          style={{
            background: "#ffffff",
            padding: "60px 0",
          }}
        >
          <div className="container">
            <div className="row align-items-center">
              <div className="col-12 text-center">
                <motion.h2
                  className="section-title mb-4"
                  initial={{ opacity: 0, y: -20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{ duration: 0.8 }}
                >
                  Premium Salon Services
                </motion.h2>
                <motion.p
                  className="mb-5"
                  style={{
                    color: "#0e0f0f",
                    maxWidth: "700px",
                    margin: "0 auto 40px",
                  }}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  Experience luxury hair care with our expert stylists using
                  top-quality products for your perfect look.
                </motion.p>

                <div className="row g-4">
                  {/* Card 1 */}
                  <motion.div
                    className="col-12 col-sm-6 col-lg-3"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ delay: 0.1, duration: 0.8 }}
                  >
                    <div className="card h-100 shadow-lg border-0 hover-card">
                      <div className="img-hover">
                        <img
                          src="https://images.fresha.com/lead-images/placeholders/barbershop-54.jpg?class=venue-gallery-mobile"
                          alt="Precision Haircut"
                          className="card-img-top"
                          style={{ height: "200px", objectFit: "cover" }}
                        />
                      </div>
                      <div className="card-body p-4 text-center">
                        <h5
                          className="card-title mb-3"
                          style={{ color: "#201548", fontWeight: "600" }}
                        >
                          Precision Haircuts
                        </h5>
                        <p
                          className="card-text mb-4"
                          style={{ color: "#0e0f0f" }}
                        >
                          Tailored cuts to suit your style and face shape,
                          crafted by master stylists.
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Card 2 */}
                  <motion.div
                    className="col-12 col-sm-6 col-lg-3"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                  >
                    <div className="card h-100 shadow-lg border-0 hover-card">
                      <div className="img-hover">
                        <img
                          src="https://trademarksalon.com/wp-content/uploads/2024/03/Balayage-vs.-Highlights.jpg"
                          alt="Balayage & Highlights"
                          className="card-img-top"
                          style={{ height: "200px", objectFit: "cover" }}
                        />
                      </div>
                      <div className="card-body p-4 text-center">
                        <h5
                          className="card-title mb-3"
                          style={{ color: "#201548", fontWeight: "600" }}
                        >
                          Balayage & Highlights
                        </h5>
                        <p
                          className="card-text mb-4"
                          style={{ color: "#0e0f0f" }}
                        >
                          Vibrant, hand-painted color for a natural, glowing
                          finish.
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Card 3 */}
                  <motion.div
                    className="col-12 col-sm-6 col-lg-3"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                  >
                    <div className="card h-100 shadow-lg border-0 hover-card">
                      <div className="img-hover">
                        <img
                          src="https://limelitesalonandspa.com/wp-content/uploads/2022/10/image-4-1024x719.png"
                          alt="Keratin Treatment"
                          className="card-img-top"
                          style={{ height: "200px", objectFit: "cover" }}
                        />
                      </div>
                      <div className="card-body p-4 text-center">
                        <h5
                          className="card-title mb-3"
                          style={{ color: "#201548", fontWeight: "600" }}
                        >
                          Keratin Treatments
                        </h5>
                        <p
                          className="card-text mb-4"
                          style={{ color: "#0e0f0f" }}
                        >
                          Smooth and strengthen your hair with frizz-free shine
                          lasting weeks.
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Card 4 */}
                  <motion.div
                    className="col-12 col-sm-6 col-lg-3"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                  >
                    <div className="card h-100 shadow-lg border-0 hover-card">
                      <div className="img-hover">
                        <img
                          src="https://www.theestheticclinic.com/blog/wp-content/uploads/2018/05/Regrow-hair-follicles-Acquire-stem-cell-hair-transplant-India.jpg"
                          alt="Scalp Treatment"
                          className="card-img-top"
                          style={{ height: "200px", objectFit: "cover" }}
                        />
                      </div>
                      <div className="card-body p-4 text-center">
                        <h5
                          className="card-title mb-3"
                          style={{ color: "#201548", fontWeight: "600" }}
                        >
                          Scalp Treatments
                        </h5>
                        <p
                          className="card-text mb-4"
                          style={{ color: "#0e0f0f" }}
                        >
                          Revitalize your scalp and boost healthy hair growth
                          naturally.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Beauty Section */}
        <section
          className="py-5"
          id="beauty"
          style={{
            background: "#f8f9fa",
            backgroundSize: "cover",
            backgroundPosition: "center",
            overflowX: "hidden",
            padding: "60px 0",
          }}
        >
          <div className="container">
            <div className="text-center">
              <motion.h2
                className="section-title mb-4"
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.8 }}
              >
                Luxury Beauty Treatments
              </motion.h2>

              <motion.p
                className="lead mb-5"
                style={{
                  fontSize: "1.1rem",
                  color: "#0e0f0f",
                  maxWidth: "700px",
                  margin: "0 auto 40px",
                }}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Discover the best beauty treatments to indulge yourself.
              </motion.p>

              <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
                {[
                  {
                    title: "Bridal Makeup",
                    text: "Flawless makeup for your big day.",
                    img: "https://queensinstyle.com/assets/images/logo-3.png",
                    delay: 0.1,
                  },
                  {
                    title: "Gel Manicures",
                    text: "Perfect nails with vibrant gel colors.",
                    img: "https://mademynail.com/cdn/shop/products/handmade-rose-gold-bling-nail-art-design-838185_1000x.jpg?v=1670334645",
                    delay: 0.2,
                  },
                  {
                    title: "Nail Art Design",
                    text: "Creative designs to showcase your style.",
                    img: "https://png.pngtree.com/png-vector/20240607/ourmid/pngtree-d-hand-with-a-metallic-rose-gold-nail-polish-on-transparent-png-image_12641216.png",
                    delay: 0.3,
                  },
                  {
                    title: "Spa Pedicures",
                    text: "Relaxing treatments for soft, pampered feet.",
                    img: "https://png.pngtree.com/png-vector/20230924/ourmid/pngtree-pedicure-and-manicure-toe-png-image_9990440.png",
                    delay: 0.4,
                  },
                ].map((card, idx) => (
                  <motion.div
                    className="col"
                    key={idx}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ delay: card.delay, duration: 0.8 }}
                  >
                    <div className="card shadow-lg rounded-4 hover-card border-0">
                      <div className="text-center pt-4">
                        <img
                          src={card.img || "/placeholder.svg"}
                          alt={card.title}
                          className="mx-auto"
                          style={{
                            width: "100px",
                            height: "100px",
                            objectFit: "contain",
                            transition: "all 0.5s ease",
                            borderRadius: "50%",
                          }}
                        />
                      </div>
                      <div className="card-body text-center">
                        <h5
                          className="card-title fw-bold"
                          style={{ fontSize: "1.3rem", color: "#201548" }}
                        >
                          {card.title}
                        </h5>
                        <p
                          className="card-text"
                          style={{ fontSize: "1rem", color: "#0e0f0f" }}
                        >
                          {card.text}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Skincare Section */}
        <section
          className="py-5"
          id="skincare"
          style={{ background: "#ffffff", padding: "60px 0" }}
        >
          <div className="container">
            <div className="row align-items-center py-5">
              {/* Left Side: Images */}
              <motion.div
                className="col-md-6 text-center mb-4 mb-md-0"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.8 }}
              >
                <div
                  className="position-relative d-flex justify-content-center"
                  style={{ height: "400px" }}
                >
                  <motion.div
                    className="position-absolute img-wrapper"
                    style={{ top: "0", left: "0" }}
                    whileHover={{ scale: 1.05, zIndex: 10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <img
                      src="https://plus.unsplash.com/premium_photo-1674739375749-7efe56fc8bbb?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8c2tpbiUyMGNhcmV8ZW58MHx8MHx8fDA%3D"
                      alt="Skincare Services 1"
                      className="img-fluid rounded shadow custom-img"
                      style={{
                        width: "300px",
                        height: "362px",
                        objectFit: "cover",
                        borderRadius: "15px",
                        border: "2px solid #201548",
                        boxShadow: "0 10px 20px rgba(32, 21, 72, 0.2)",
                      }}
                    />
                  </motion.div>
                  <motion.div
                    className="position-absolute img-wrapper"
                    style={{ top: "40px", left: "80px" }}
                    whileHover={{ scale: 1.05, zIndex: 10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <img
                      src="https://healthwire.pk/wp-content/uploads/2022/06/skin-care-tips-for-summer.jpg"
                      alt="Skincare Services 2"
                      className="img-fluid rounded shadow custom-img"
                      style={{
                        width: "300px",
                        height: "362px",
                        objectFit: "cover",
                        borderRadius: "15px",
                        border: "2px solid #201548",
                        boxShadow: "0 10px 20px rgba(32, 21, 72, 0.2)",
                      }}
                    />
                  </motion.div>
                  <motion.div
                    className="position-absolute img-wrapper"
                    style={{ top: "80px", left: "160px" }}
                    whileHover={{ scale: 1.05, zIndex: 10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <img
                      src="https://images.pexels.com/photos/3757657/pexels-photo-3757657.jpeg?auto=compress&cs=tinysrgb&w=600"
                      alt="Skincare Services 3"
                      className="img-fluid rounded shadow custom-img"
                      style={{
                        width: "300px",
                        height: "362px",
                        objectFit: "cover",
                        borderRadius: "15px",
                        border: "2px solid #201548",
                        boxShadow: "0 10px 20px rgba(32, 21, 72, 0.2)",
                      }}
                    />
                  </motion.div>
                </div>
              </motion.div>

              {/* Right Side: Text */}
              <motion.div
                className="col-md-6 text-start"
                initial={{ opacity: 0, x: 0 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <h2
                  className="section-title mb-3"
                  style={{ textAlign: "left" }}
                >
                  Radiant Skincare
                </h2>
                <h3 className="fw-bold mb-4" style={{ color: "#0e0f0f" }}>
                  Transform your skin with Beauty Bliss
                </h3>
                <p className="lead mb-4" style={{ color: "#0e0f0f" }}>
                  At Beauty Bliss, our expert skincare treatments rejuvenate and
                  nourish your skin, helping you achieve a flawless, glowing
                  complexion with personalized care.
                </p>
                <ul className="list-unstyled">
                  <motion.li
                    className="d-flex align-items-start mb-3"
                    initial={{ opacity: 0, x: 0 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    style={{
                      color:'black',
                      padding: "12px 15px",
                      borderRadius: "8px",
                      border: "1px solid rgba(32, 21, 72, 0.1)",
                      transition: "all 0.3s ease",
                    }}
                    whileHover={{
                      boxShadow: "0 5px 15px rgba(32, 21, 72, 0.1)",
                      translateY: -3,
                    }}
                  >
                    <span
                      style={{
                        color: "#201548",
                        marginRight: "10px",
                        fontWeight: "bold",
                      }}
                    >
                      ✔️
                    </span>
                    Customized facials tailored to your skin type
                  </motion.li>
                  <motion.li
                    className="d-flex align-items-start mb-3"
                    initial={{ opacity: 0, x: 0 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    style={{
                      color:'black',
                      padding: "12px 15px",
                      borderRadius: "8px",
                      border: "1px solid rgba(32, 21, 72, 0.1)",
                      transition: "all 0.3s ease",
                    }}
                    whileHover={{
                      boxShadow: "0 5px 15px rgba(32, 21, 72, 0.1)",
                      translateY: -3,
                    }}
                  >
                    <span
                      style={{
                        color: "#201548",
                        marginRight: "10px",
                        fontWeight: "bold",
                      }}
                    >
                      ✔️
                    </span>
                    Advanced treatments for lasting hydration
                  </motion.li>
                  <motion.li
                    className="d-flex align-items-start mb-3"
                    initial={{ opacity: 0, x: 0 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    style={{
                      color:'black',
                      padding: "12px 15px",
                      borderRadius: "8px",
                      border: "1px solid rgba(32, 21, 72, 0.1)",
                      transition: "all 0.3s ease",
                    }}
                    whileHover={{
                      boxShadow: "0 5px 15px rgba(32, 21, 72, 0.1)",
                      translateY: -3,
                    }}
                  >
                    <span
                      style={{
                        color: "#201548",
                        marginRight: "10px",
                        fontWeight: "bold",
                      }}
                    >
                      ✔️
                    </span>
                    Natural products for a healthy, radiant glow
                  </motion.li>
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Footer Section */}
        <footer
          className="py-5"
          style={{ background: "#f8f9fa", borderTop: "5px solid #201548" }}
        >
          <div className="container">
            <div className="row g-4">
              {/* Contact Info */}
              <motion.div
                className="col-md-4 text-center text-md-start"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.8 }}
              >
                <h4
                  className="fw-bold mb-4"
                  style={{ color: "#201548", position: "relative" }}
                >
                  Contact Us
                  {/* <span
                    style={{
                      position: "absolute",
                      bottom: "-10px",
                      left: "0",
                      width: "50px",
                      height: "3px",
                      background: "#201548",
                      borderRadius: "2px",
                    }}
                  ></span> */}
                </h4>
                <p className="mb-2" style={{ color: "#0e0f0f" }}>
                  <i className="bi bi-geo-alt me-2"></i>Lb nagar vanasthalipuram
                  hyderabad 500070
                </p>
                <p className="mb-2" style={{ color: "#0e0f0f" }}>
                  <i className="bi bi-telephone me-2"></i> (+91) 9777733220
                </p>
                <p className="mb-2" style={{ color: "#0e0f0f" }}>
                  <i className="bi bi-envelope me-2"></i> beautybliss@gmail.com
                </p>
              </motion.div>

              {/* Quick Links */}
              <motion.div
                className="col-md-4 text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <h4
                  className="fw-bold mb-4"
                  style={{ color: "#201548", position: "relative" }}
                >
                  Quick Links
                  {/* <span
                    style={{
                      position: "absolute",
                      bottom: "-10px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: "50px",
                      height: "3px",
                      background: "#201548",
                      borderRadius: "2px",
                    }}
                  ></span> */}
                </h4>
                <div className="d-flex flex-column">
                  <a
                    href="/salon"
                    className="mb-2 text-decoration-none"
                    style={{
                      color: "#201548",
                      transition: "all 0.3s ease",
                      fontWeight: "500",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateX(5px)";
                      e.currentTarget.style.color = "#0e0f0f";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateX(0)";
                      e.currentTarget.style.color = "#201548";
                    }}
                  >
                    Salon Services
                  </a>
                  <a
                    href="/beauty"
                    className="mb-2 text-decoration-none"
                    style={{
                      color: "#201548",
                      transition: "all 0.3s ease",
                      fontWeight: "500",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateX(5px)";
                      e.currentTarget.style.color = "#0e0f0f";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateX(0)";
                      e.currentTarget.style.color = "#201548";
                    }}
                  >
                    Beauty Treatments
                  </a>
                  <a
                    href="/skincare"
                    className="mb-2 text-decoration-none"
                    style={{
                      color: "#201548",
                      transition: "all 0.3s ease",
                      fontWeight: "500",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateX(5px)";
                      e.currentTarget.style.color = "#0e0f0f";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateX(0)";
                      e.currentTarget.style.color = "#201548";
                    }}
                  >
                    Skincare Solutions
                  </a>
                </div>
              </motion.div>

              {/* Social Media */}
              <motion.div
                className="col-md-4 text-center text-md-end"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <h4
                  className="fw-bold mb-4"
                  style={{ color: "#201548", position: "relative" }}
                >
                  Follow Us
                  {/* <span
                    style={{
                      position: "absolute",
                      bottom: "-10px",
                      right: "0",
                      width: "50px",
                      height: "3px",
                      background: "#201548",
                      borderRadius: "2px",
                    }}
                  ></span> */}
                </h4>
                <div className="d-flex justify-content-center justify-content-md-end gap-3">
                  <a
                    href="https://facebook.com"
                    style={{
                      color: "#201548",
                      transition: "all 0.3s ease",
                    }}
                    target="_blank"
                    rel="noopener noreferrer"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.2)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    <i className="bi bi-facebook fs-3"></i>
                  </a>
                  <a
                    href="https://twitter.com"
                    style={{
                      color: "#201548",
                      transition: "all 0.3s ease",
                    }}
                    target="_blank"
                    rel="noopener noreferrer"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.2)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    <i className="bi bi-twitter fs-3"></i>
                  </a>
                  <a
                    href="https://instagram.com"
                    style={{
                      color: "#201548",
                      transition: "all 0.3s ease",
                    }}
                    target="_blank"
                    rel="noopener noreferrer"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.2)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    <i className="bi bi-instagram fs-3"></i>
                  </a>
                </div>
              </motion.div>
            </div>

            {/* Copyright */}
            <div className="text-center mt-5" style={{ color: "#0e0f0f" }}>
              <p className="mb-0">
                ©️ {new Date().getFullYear()} BeautyBliss. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Home;
