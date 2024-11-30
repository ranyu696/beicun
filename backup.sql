PGDMP       1            
    |            beicun    16.3    16.3 b    �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false            �           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false            �           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false            �           1262    165557    beicun    DATABASE     �   CREATE DATABASE beicun WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'Chinese (Simplified)_China.936';
    DROP DATABASE beicun;
                postgres    false                        2615    166250    public    SCHEMA     2   -- *not* creating schema, since initdb creates it
 2   -- *not* dropping schema, since initdb creates it
                postgres    false            �           0    0    SCHEMA public    COMMENT         COMMENT ON SCHEMA public IS '';
                   postgres    false    5            �           0    0    SCHEMA public    ACL     +   REVOKE USAGE ON SCHEMA public FROM PUBLIC;
                   postgres    false    5            n           1247    166312    CommentStatus    TYPE     ^   CREATE TYPE public."CommentStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);
 "   DROP TYPE public."CommentStatus";
       public          postgres    false    5            b           1247    166280    DurabilityLevel    TYPE     V   CREATE TYPE public."DurabilityLevel" AS ENUM (
    'HIGH',
    'MEDIUM',
    'LOW'
);
 $   DROP TYPE public."DurabilityLevel";
       public          postgres    false    5            e           1247    166288    Level    TYPE     L   CREATE TYPE public."Level" AS ENUM (
    'HIGH',
    'MEDIUM',
    'LOW'
);
    DROP TYPE public."Level";
       public          postgres    false    5            k           1247    166304    ReviewStatus    TYPE     ^   CREATE TYPE public."ReviewStatus" AS ENUM (
    'PENDING',
    'PUBLISHED',
    'ARCHIVED'
);
 !   DROP TYPE public."ReviewStatus";
       public          postgres    false    5            \           1247    166260    SoftnessLevel    TYPE     y   CREATE TYPE public."SoftnessLevel" AS ENUM (
    'ULTRA_SOFT',
    'SOFT',
    'MEDIUM',
    'HARD',
    'ULTRA_HARD'
);
 "   DROP TYPE public."SoftnessLevel";
       public          postgres    false    5            Y           1247    166252    StimulationLevel    TYPE     W   CREATE TYPE public."StimulationLevel" AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH'
);
 %   DROP TYPE public."StimulationLevel";
       public          postgres    false    5            _           1247    166272    TightnessLevel    TYPE     X   CREATE TYPE public."TightnessLevel" AS ENUM (
    'TIGHT',
    'MEDIUM',
    'LOOSE'
);
 #   DROP TYPE public."TightnessLevel";
       public          postgres    false    5            h           1247    166296    UserRole    TYPE     Q   CREATE TYPE public."UserRole" AS ENUM (
    'USER',
    'EDITOR',
    'ADMIN'
);
    DROP TYPE public."UserRole";
       public          postgres    false    5            �            1259    166328    Account    TABLE     �  CREATE TABLE public."Account" (
    "userId" text NOT NULL,
    type text NOT NULL,
    provider text NOT NULL,
    "providerAccountId" text NOT NULL,
    refresh_token text,
    access_token text,
    expires_at integer,
    token_type text,
    scope text,
    id_token text,
    session_state text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);
    DROP TABLE public."Account";
       public         heap    postgres    false    5            �            1259    166357    Authenticator    TABLE     >  CREATE TABLE public."Authenticator" (
    "credentialID" text NOT NULL,
    "userId" text NOT NULL,
    "providerAccountId" text NOT NULL,
    "credentialPublicKey" text NOT NULL,
    counter integer NOT NULL,
    "credentialDeviceType" text NOT NULL,
    "credentialBackedUp" boolean NOT NULL,
    transports text
);
 #   DROP TABLE public."Authenticator";
       public         heap    postgres    false    5            �            1259    166342    EmailLoginHistory    TABLE       CREATE TABLE public."EmailLoginHistory" (
    id text NOT NULL,
    email text NOT NULL,
    success boolean NOT NULL,
    "ipAddress" text,
    "userAgent" text,
    location text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
 '   DROP TABLE public."EmailLoginHistory";
       public         heap    postgres    false    5            �            1259    166336    Session    TABLE     !  CREATE TABLE public."Session" (
    "sessionToken" text NOT NULL,
    "userId" text NOT NULL,
    expires timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);
    DROP TABLE public."Session";
       public         heap    postgres    false    5            �            1259    166319    User    TABLE     3  CREATE TABLE public."User" (
    id text NOT NULL,
    name text,
    email text NOT NULL,
    password text,
    "verificationToken" text,
    "resetToken" text,
    "resetTokenExpiry" timestamp(3) without time zone,
    image text,
    role public."UserRole" DEFAULT 'USER'::public."UserRole" NOT NULL,
    bio text,
    "lastLoginAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "emailVerified" boolean DEFAULT false NOT NULL
);
    DROP TABLE public."User";
       public         heap    postgres    false    872    5    872            �            1259    166350    VerificationToken    TABLE     �   CREATE TABLE public."VerificationToken" (
    identifier text NOT NULL,
    token text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);
 '   DROP TABLE public."VerificationToken";
       public         heap    postgres    false    5            �            1259    166457    brands    TABLE     j  CREATE TABLE public.brands (
    id text NOT NULL,
    name text NOT NULL,
    logo text,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    website text,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL
);
    DROP TABLE public.brands;
       public         heap    postgres    false    5            �            1259    166447    channel_types    TABLE     P  CREATE TABLE public.channel_types (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);
 !   DROP TABLE public.channel_types;
       public         heap    postgres    false    5            �            1259    166404    comments    TABLE     n  CREATE TABLE public.comments (
    id text NOT NULL,
    "reviewId" text NOT NULL,
    "userId" text NOT NULL,
    content text NOT NULL,
    status public."CommentStatus" DEFAULT 'PENDING'::public."CommentStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);
    DROP TABLE public.comments;
       public         heap    postgres    false    878    5    878            �            1259    166467    material_types    TABLE     Q  CREATE TABLE public.material_types (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);
 "   DROP TABLE public.material_types;
       public         heap    postgres    false    5            �            1259    166429    product_images    TABLE       CREATE TABLE public.product_images (
    id text NOT NULL,
    "productId" text NOT NULL,
    "imageUrl" text NOT NULL,
    description text,
    "sortOrder" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
 "   DROP TABLE public.product_images;
       public         heap    postgres    false    5            �            1259    166385    product_ratings    TABLE       CREATE TABLE public.product_ratings (
    id text NOT NULL,
    rating double precision NOT NULL,
    reason text,
    "productId" text NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
 #   DROP TABLE public.product_ratings;
       public         heap    postgres    false    5            �            1259    166421    product_tags    TABLE     �   CREATE TABLE public.product_tags (
    "productId" text NOT NULL,
    "tagId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
     DROP TABLE public.product_tags;
       public         heap    postgres    false    5            �            1259    166587    product_types    TABLE     _  CREATE TABLE public.product_types (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    icon text,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);
 !   DROP TABLE public.product_types;
       public         heap    postgres    false    5            �            1259    166374    products    TABLE     q  CREATE TABLE public.products (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    "registrationDate" timestamp(3) without time zone NOT NULL,
    description text,
    "taobaoUrl" text,
    "mainImage" text NOT NULL,
    "salesImage" text NOT NULL,
    "videoUrl" text,
    "detailImages" text[],
    "utilityTypeId" text NOT NULL,
    "channelTypeId" text NOT NULL,
    "brandId" text NOT NULL,
    "materialTypeId" text NOT NULL,
    "viewCount" integer DEFAULT 0 NOT NULL,
    "averageRating" double precision DEFAULT 0 NOT NULL,
    "totalRatings" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "productTypeId" text NOT NULL,
    "channelLength" double precision NOT NULL,
    durability public."DurabilityLevel" NOT NULL,
    height double precision NOT NULL,
    "isReversible" boolean NOT NULL,
    length double precision NOT NULL,
    oiliness public."Level" NOT NULL,
    price double precision NOT NULL,
    smell public."Level" NOT NULL,
    softness public."SoftnessLevel" NOT NULL,
    stimulation public."StimulationLevel" NOT NULL,
    tightness public."TightnessLevel" NOT NULL,
    "totalLength" double precision NOT NULL,
    version text NOT NULL,
    weight double precision NOT NULL,
    width double precision NOT NULL
);
    DROP TABLE public.products;
       public         heap    postgres    false    863    5    866    869    869    860    857            �            1259    166393    reviews    TABLE     �  CREATE TABLE public.reviews (
    id text NOT NULL,
    title text NOT NULL,
    status public."ReviewStatus" DEFAULT 'PENDING'::public."ReviewStatus" NOT NULL,
    "productId" text NOT NULL,
    "userId" text NOT NULL,
    unboxing text NOT NULL,
    experience text NOT NULL,
    maintenance text NOT NULL,
    pros text[],
    cons text[],
    conclusion text NOT NULL,
    views integer DEFAULT 0 NOT NULL,
    "isRecommended" boolean DEFAULT false NOT NULL,
    "publishedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);
    DROP TABLE public.reviews;
       public         heap    postgres    false    875    5    875            �            1259    166413    tags    TABLE     �   CREATE TABLE public.tags (
    id text NOT NULL,
    name text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);
    DROP TABLE public.tags;
       public         heap    postgres    false    5            �            1259    166437    utility_types    TABLE     _  CREATE TABLE public.utility_types (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    icon text,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);
 !   DROP TABLE public.utility_types;
       public         heap    postgres    false    5            �          0    166328    Account 
   TABLE DATA           �   COPY public."Account" ("userId", type, provider, "providerAccountId", refresh_token, access_token, expires_at, token_type, scope, id_token, session_state, "createdAt", "updatedAt") FROM stdin;
    public          postgres    false    216   �       �          0    166357    Authenticator 
   TABLE DATA           �   COPY public."Authenticator" ("credentialID", "userId", "providerAccountId", "credentialPublicKey", counter, "credentialDeviceType", "credentialBackedUp", transports) FROM stdin;
    public          postgres    false    220   (�       �          0    166342    EmailLoginHistory 
   TABLE DATA           r   COPY public."EmailLoginHistory" (id, email, success, "ipAddress", "userAgent", location, "createdAt") FROM stdin;
    public          postgres    false    218   E�       �          0    166336    Session 
   TABLE DATA           `   COPY public."Session" ("sessionToken", "userId", expires, "createdAt", "updatedAt") FROM stdin;
    public          postgres    false    217   b�       �          0    166319    User 
   TABLE DATA           �   COPY public."User" (id, name, email, password, "verificationToken", "resetToken", "resetTokenExpiry", image, role, bio, "lastLoginAt", "createdAt", "updatedAt", "emailVerified") FROM stdin;
    public          postgres    false    215   �       �          0    166350    VerificationToken 
   TABLE DATA           I   COPY public."VerificationToken" (identifier, token, expires) FROM stdin;
    public          postgres    false    219   G�       �          0    166457    brands 
   TABLE DATA           y   COPY public.brands (id, name, logo, description, "createdAt", "updatedAt", website, "sortOrder", "isActive") FROM stdin;
    public          postgres    false    230   d�       �          0    166447    channel_types 
   TABLE DATA           q   COPY public.channel_types (id, name, description, "sortOrder", "isActive", "createdAt", "updatedAt") FROM stdin;
    public          postgres    false    229   ��       �          0    166404    comments 
   TABLE DATA           g   COPY public.comments (id, "reviewId", "userId", content, status, "createdAt", "updatedAt") FROM stdin;
    public          postgres    false    224   ��       �          0    166467    material_types 
   TABLE DATA           r   COPY public.material_types (id, name, description, "sortOrder", "isActive", "createdAt", "updatedAt") FROM stdin;
    public          postgres    false    231   ��       �          0    166429    product_images 
   TABLE DATA           l   COPY public.product_images (id, "productId", "imageUrl", description, "sortOrder", "createdAt") FROM stdin;
    public          postgres    false    227   ؍       �          0    166385    product_ratings 
   TABLE DATA           a   COPY public.product_ratings (id, rating, reason, "productId", "userId", "createdAt") FROM stdin;
    public          postgres    false    222   ��       �          0    166421    product_tags 
   TABLE DATA           I   COPY public.product_tags ("productId", "tagId", "createdAt") FROM stdin;
    public          postgres    false    226   �       �          0    166587    product_types 
   TABLE DATA           w   COPY public.product_types (id, name, description, icon, "sortOrder", "isActive", "createdAt", "updatedAt") FROM stdin;
    public          postgres    false    232   /�       �          0    166374    products 
   TABLE DATA           �  COPY public.products (id, name, slug, "registrationDate", description, "taobaoUrl", "mainImage", "salesImage", "videoUrl", "detailImages", "utilityTypeId", "channelTypeId", "brandId", "materialTypeId", "viewCount", "averageRating", "totalRatings", "createdAt", "updatedAt", "productTypeId", "channelLength", durability, height, "isReversible", length, oiliness, price, smell, softness, stimulation, tightness, "totalLength", version, weight, width) FROM stdin;
    public          postgres    false    221   L�       �          0    166393    reviews 
   TABLE DATA           �   COPY public.reviews (id, title, status, "productId", "userId", unboxing, experience, maintenance, pros, cons, conclusion, views, "isRecommended", "publishedAt", "createdAt", "updatedAt") FROM stdin;
    public          postgres    false    223   i�       �          0    166413    tags 
   TABLE DATA           B   COPY public.tags (id, name, "createdAt", "updatedAt") FROM stdin;
    public          postgres    false    225   ��       �          0    166437    utility_types 
   TABLE DATA           w   COPY public.utility_types (id, name, description, icon, "sortOrder", "isActive", "createdAt", "updatedAt") FROM stdin;
    public          postgres    false    228   ��       �           2606    166335    Account Account_pkey 
   CONSTRAINT     q   ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_pkey" PRIMARY KEY (provider, "providerAccountId");
 B   ALTER TABLE ONLY public."Account" DROP CONSTRAINT "Account_pkey";
       public            postgres    false    216    216            �           2606    166363     Authenticator Authenticator_pkey 
   CONSTRAINT     x   ALTER TABLE ONLY public."Authenticator"
    ADD CONSTRAINT "Authenticator_pkey" PRIMARY KEY ("userId", "credentialID");
 N   ALTER TABLE ONLY public."Authenticator" DROP CONSTRAINT "Authenticator_pkey";
       public            postgres    false    220    220            �           2606    166349 (   EmailLoginHistory EmailLoginHistory_pkey 
   CONSTRAINT     j   ALTER TABLE ONLY public."EmailLoginHistory"
    ADD CONSTRAINT "EmailLoginHistory_pkey" PRIMARY KEY (id);
 V   ALTER TABLE ONLY public."EmailLoginHistory" DROP CONSTRAINT "EmailLoginHistory_pkey";
       public            postgres    false    218            �           2606    166327    User User_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);
 <   ALTER TABLE ONLY public."User" DROP CONSTRAINT "User_pkey";
       public            postgres    false    215            �           2606    166356 (   VerificationToken VerificationToken_pkey 
   CONSTRAINT     y   ALTER TABLE ONLY public."VerificationToken"
    ADD CONSTRAINT "VerificationToken_pkey" PRIMARY KEY (identifier, token);
 V   ALTER TABLE ONLY public."VerificationToken" DROP CONSTRAINT "VerificationToken_pkey";
       public            postgres    false    219    219            �           2606    166466    brands brands_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_pkey PRIMARY KEY (id);
 <   ALTER TABLE ONLY public.brands DROP CONSTRAINT brands_pkey;
       public            postgres    false    230            �           2606    166456     channel_types channel_types_pkey 
   CONSTRAINT     ^   ALTER TABLE ONLY public.channel_types
    ADD CONSTRAINT channel_types_pkey PRIMARY KEY (id);
 J   ALTER TABLE ONLY public.channel_types DROP CONSTRAINT channel_types_pkey;
       public            postgres    false    229            �           2606    166412    comments comments_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.comments DROP CONSTRAINT comments_pkey;
       public            postgres    false    224            �           2606    166476 "   material_types material_types_pkey 
   CONSTRAINT     `   ALTER TABLE ONLY public.material_types
    ADD CONSTRAINT material_types_pkey PRIMARY KEY (id);
 L   ALTER TABLE ONLY public.material_types DROP CONSTRAINT material_types_pkey;
       public            postgres    false    231            �           2606    166436 "   product_images product_images_pkey 
   CONSTRAINT     `   ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_pkey PRIMARY KEY (id);
 L   ALTER TABLE ONLY public.product_images DROP CONSTRAINT product_images_pkey;
       public            postgres    false    227            �           2606    166392 $   product_ratings product_ratings_pkey 
   CONSTRAINT     b   ALTER TABLE ONLY public.product_ratings
    ADD CONSTRAINT product_ratings_pkey PRIMARY KEY (id);
 N   ALTER TABLE ONLY public.product_ratings DROP CONSTRAINT product_ratings_pkey;
       public            postgres    false    222            �           2606    166428    product_tags product_tags_pkey 
   CONSTRAINT     n   ALTER TABLE ONLY public.product_tags
    ADD CONSTRAINT product_tags_pkey PRIMARY KEY ("productId", "tagId");
 H   ALTER TABLE ONLY public.product_tags DROP CONSTRAINT product_tags_pkey;
       public            postgres    false    226    226            �           2606    166596     product_types product_types_pkey 
   CONSTRAINT     ^   ALTER TABLE ONLY public.product_types
    ADD CONSTRAINT product_types_pkey PRIMARY KEY (id);
 J   ALTER TABLE ONLY public.product_types DROP CONSTRAINT product_types_pkey;
       public            postgres    false    232            �           2606    166384    products products_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.products DROP CONSTRAINT products_pkey;
       public            postgres    false    221            �           2606    166403    reviews reviews_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);
 >   ALTER TABLE ONLY public.reviews DROP CONSTRAINT reviews_pkey;
       public            postgres    false    223            �           2606    166420    tags tags_pkey 
   CONSTRAINT     L   ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);
 8   ALTER TABLE ONLY public.tags DROP CONSTRAINT tags_pkey;
       public            postgres    false    225            �           2606    166446     utility_types utility_types_pkey 
   CONSTRAINT     ^   ALTER TABLE ONLY public.utility_types
    ADD CONSTRAINT utility_types_pkey PRIMARY KEY (id);
 J   ALTER TABLE ONLY public.utility_types DROP CONSTRAINT utility_types_pkey;
       public            postgres    false    228            �           1259    166482    Authenticator_credentialID_key    INDEX     m   CREATE UNIQUE INDEX "Authenticator_credentialID_key" ON public."Authenticator" USING btree ("credentialID");
 4   DROP INDEX public."Authenticator_credentialID_key";
       public            postgres    false    220            �           1259    166481    EmailLoginHistory_email_idx    INDEX     ^   CREATE INDEX "EmailLoginHistory_email_idx" ON public."EmailLoginHistory" USING btree (email);
 1   DROP INDEX public."EmailLoginHistory_email_idx";
       public            postgres    false    218            �           1259    166480    Session_sessionToken_key    INDEX     a   CREATE UNIQUE INDEX "Session_sessionToken_key" ON public."Session" USING btree ("sessionToken");
 .   DROP INDEX public."Session_sessionToken_key";
       public            postgres    false    217            �           1259    166477    User_email_key    INDEX     K   CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);
 $   DROP INDEX public."User_email_key";
       public            postgres    false    215            �           1259    166479    User_resetToken_key    INDEX     W   CREATE UNIQUE INDEX "User_resetToken_key" ON public."User" USING btree ("resetToken");
 )   DROP INDEX public."User_resetToken_key";
       public            postgres    false    215            �           1259    166478    User_verificationToken_key    INDEX     e   CREATE UNIQUE INDEX "User_verificationToken_key" ON public."User" USING btree ("verificationToken");
 0   DROP INDEX public."User_verificationToken_key";
       public            postgres    false    215            �           1259    166488    brands_name_key    INDEX     I   CREATE UNIQUE INDEX brands_name_key ON public.brands USING btree (name);
 #   DROP INDEX public.brands_name_key;
       public            postgres    false    230            �           1259    166487    channel_types_name_key    INDEX     W   CREATE UNIQUE INDEX channel_types_name_key ON public.channel_types USING btree (name);
 *   DROP INDEX public.channel_types_name_key;
       public            postgres    false    229            �           1259    166489    material_types_name_key    INDEX     Y   CREATE UNIQUE INDEX material_types_name_key ON public.material_types USING btree (name);
 +   DROP INDEX public.material_types_name_key;
       public            postgres    false    231            �           1259    166597    product_types_name_key    INDEX     W   CREATE UNIQUE INDEX product_types_name_key ON public.product_types USING btree (name);
 *   DROP INDEX public.product_types_name_key;
       public            postgres    false    232            �           1259    166484    products_slug_key    INDEX     M   CREATE UNIQUE INDEX products_slug_key ON public.products USING btree (slug);
 %   DROP INDEX public.products_slug_key;
       public            postgres    false    221            �           1259    166485    tags_name_key    INDEX     E   CREATE UNIQUE INDEX tags_name_key ON public.tags USING btree (name);
 !   DROP INDEX public.tags_name_key;
       public            postgres    false    225            �           1259    166486    utility_types_name_key    INDEX     W   CREATE UNIQUE INDEX utility_types_name_key ON public.utility_types USING btree (name);
 *   DROP INDEX public.utility_types_name_key;
       public            postgres    false    228            �           2606    166490    Account Account_userId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;
 I   ALTER TABLE ONLY public."Account" DROP CONSTRAINT "Account_userId_fkey";
       public          postgres    false    215    4816    216            �           2606    166500 '   Authenticator Authenticator_userId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."Authenticator"
    ADD CONSTRAINT "Authenticator_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;
 U   ALTER TABLE ONLY public."Authenticator" DROP CONSTRAINT "Authenticator_userId_fkey";
       public          postgres    false    4816    215    220            �           2606    166495    Session Session_userId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;
 I   ALTER TABLE ONLY public."Session" DROP CONSTRAINT "Session_userId_fkey";
       public          postgres    false    4816    217    215            	           2606    166560    comments comments_reviewId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.comments
    ADD CONSTRAINT "comments_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES public.reviews(id) ON UPDATE CASCADE ON DELETE RESTRICT;
 K   ALTER TABLE ONLY public.comments DROP CONSTRAINT "comments_reviewId_fkey";
       public          postgres    false    223    224    4836            
           2606    166565    comments comments_userId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.comments
    ADD CONSTRAINT "comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;
 I   ALTER TABLE ONLY public.comments DROP CONSTRAINT "comments_userId_fkey";
       public          postgres    false    215    224    4816                       2606    166580 ,   product_images product_images_productId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT "product_images_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;
 X   ALTER TABLE ONLY public.product_images DROP CONSTRAINT "product_images_productId_fkey";
       public          postgres    false    221    227    4831                       2606    166530 .   product_ratings product_ratings_productId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.product_ratings
    ADD CONSTRAINT "product_ratings_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;
 Z   ALTER TABLE ONLY public.product_ratings DROP CONSTRAINT "product_ratings_productId_fkey";
       public          postgres    false    4831    221    222                       2606    166540 +   product_ratings product_ratings_userId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.product_ratings
    ADD CONSTRAINT "product_ratings_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;
 W   ALTER TABLE ONLY public.product_ratings DROP CONSTRAINT "product_ratings_userId_fkey";
       public          postgres    false    215    4816    222                       2606    166570 (   product_tags product_tags_productId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.product_tags
    ADD CONSTRAINT "product_tags_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;
 T   ALTER TABLE ONLY public.product_tags DROP CONSTRAINT "product_tags_productId_fkey";
       public          postgres    false    221    4831    226                       2606    166575 $   product_tags product_tags_tagId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.product_tags
    ADD CONSTRAINT "product_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES public.tags(id) ON UPDATE CASCADE ON DELETE RESTRICT;
 P   ALTER TABLE ONLY public.product_tags DROP CONSTRAINT "product_tags_tagId_fkey";
       public          postgres    false    4841    226    225                        2606    166520    products products_brandId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.products
    ADD CONSTRAINT "products_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES public.brands(id) ON UPDATE CASCADE ON DELETE RESTRICT;
 J   ALTER TABLE ONLY public.products DROP CONSTRAINT "products_brandId_fkey";
       public          postgres    false    221    4854    230                       2606    166515 $   products products_channelTypeId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.products
    ADD CONSTRAINT "products_channelTypeId_fkey" FOREIGN KEY ("channelTypeId") REFERENCES public.channel_types(id) ON UPDATE CASCADE ON DELETE RESTRICT;
 P   ALTER TABLE ONLY public.products DROP CONSTRAINT "products_channelTypeId_fkey";
       public          postgres    false    229    4851    221                       2606    166525 %   products products_materialTypeId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.products
    ADD CONSTRAINT "products_materialTypeId_fkey" FOREIGN KEY ("materialTypeId") REFERENCES public.material_types(id) ON UPDATE CASCADE ON DELETE RESTRICT;
 Q   ALTER TABLE ONLY public.products DROP CONSTRAINT "products_materialTypeId_fkey";
       public          postgres    false    221    231    4857                       2606    166598 $   products products_productTypeId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.products
    ADD CONSTRAINT "products_productTypeId_fkey" FOREIGN KEY ("productTypeId") REFERENCES public.product_types(id) ON UPDATE CASCADE ON DELETE RESTRICT;
 P   ALTER TABLE ONLY public.products DROP CONSTRAINT "products_productTypeId_fkey";
       public          postgres    false    221    232    4860                       2606    166510 $   products products_utilityTypeId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.products
    ADD CONSTRAINT "products_utilityTypeId_fkey" FOREIGN KEY ("utilityTypeId") REFERENCES public.utility_types(id) ON UPDATE CASCADE ON DELETE RESTRICT;
 P   ALTER TABLE ONLY public.products DROP CONSTRAINT "products_utilityTypeId_fkey";
       public          postgres    false    4848    221    228                       2606    166545    reviews reviews_productId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT "reviews_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;
 J   ALTER TABLE ONLY public.reviews DROP CONSTRAINT "reviews_productId_fkey";
       public          postgres    false    4831    223    221                       2606    166555    reviews reviews_userId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT "reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;
 G   ALTER TABLE ONLY public.reviews DROP CONSTRAINT "reviews_userId_fkey";
       public          postgres    false    4816    223    215            �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �   �   x�u���0Fgx
�b[~zqRc�����K��F�� �O��8��'g�RT[��=�W��?��5��͝R��I�ύ:]��j�*�`//�j��I�0�}ĶrܭY�Mb�@���,9gی�L���b�SaN4�=�H)`ZY �8����(���b
�De�=�=����{��|�u_�;�      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �     