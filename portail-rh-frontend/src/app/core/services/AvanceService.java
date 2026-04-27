package com.rh.portail_rh.service;

import com.rh.portail_rh.entity.Avance;
import com.rh.portail_rh.entity.Demande;
import com.rh.portail_rh.entity.Utilisateur;
import com.rh.portail_rh.enums.StatutDemande;
import com.rh.portail_rh.enums.TypeDemande;
import com.rh.portail_rh.repository.AvanceRepository;
import com.rh.portail_rh.repository.DemandeRepository;
import com.rh.portail_rh.repository.UtilisateurRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class AvanceService {

    private final AvanceRepository avanceRepository;
    private final DemandeRepository demandeRepository;
    private final UtilisateurRepository utilisateurRepository;

    public AvanceService(AvanceRepository avanceRepository,
                         DemandeRepository demandeRepository,
                         UtilisateurRepository utilisateurRepository) {
        this.avanceRepository = avanceRepository;
        this.demandeRepository = demandeRepository;
        this.utilisateurRepository = utilisateurRepository;
    }

    private Utilisateur getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
    }

    @Transactional
    public Avance createAvance(Map<String, Object> request) {
        Utilisateur currentUser = getCurrentUser();

        Demande demande = new Demande();
        demande.setTypeDemande(TypeDemande.AVANCE_SALAIRE);
        demande.setStatut(StatutDemande.EN_ATTENTE);
        demande.setUtilisateur(currentUser);
        demande.setCommentaire((String) request.get("motif"));

        Demande savedDemande = demandeRepository.save(demande);

        Avance avance = new Avance();
        avance.setMontant(Double.parseDouble(request.get("montant").toString()));
        avance.setMotif((String) request.get("motif"));
        avance.setDemande(savedDemande);

        return avanceRepository.save(avance);
    }

    public List<Avance> getAvancesByEmploye(Integer employeId) {
        Utilisateur employe = utilisateurRepository.findById(employeId)
                .orElseThrow(() -> new RuntimeException("Employé non trouvé"));
        return avanceRepository.findByDemande_Utilisateur(employe);
    }

    @Transactional
    public void deleteAvance(Integer avanceId) {
        Avance avance = avanceRepository.findById(avanceId)
                .orElseThrow(() -> new RuntimeException("Avance non trouvée"));
        demandeRepository.delete(avance.getDemande());
        avanceRepository.delete(avance);
    }
}